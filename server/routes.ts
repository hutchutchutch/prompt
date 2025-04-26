import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { InsertPromptTest, InsertPromptResult, InsertSavedPrompt } from "@shared/schema";
import { z } from "zod";

// Type for WebSocket events
interface ProgressEvent {
  type: string;
  testId: number;
  modelId: string;
  variantId: string;
  progress: number;
  message?: string;
  firstTokenLatency?: number;
  totalTime?: number;
  output?: string;
  qualityScore?: number;
  costUsd?: number;
  vulnerabilityStatus?: string;
}

// Connection tracking
const connections = new Map<number, Set<WebSocket>>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server for real-time progress
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let testId: number | null = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "subscribe" && data.testId) {
          testId = data.testId;
          
          // Add this connection to the test's subscribers
          if (!connections.has(testId)) {
            connections.set(testId, new Set());
          }
          connections.get(testId)!.add(ws);
          
          // Send initial connection confirmation
          ws.send(JSON.stringify({
            type: "connected",
            testId,
            message: "Connected to test progress updates"
          }));
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    ws.on("close", () => {
      // Clean up connection on disconnect
      if (testId && connections.has(testId)) {
        connections.get(testId)!.delete(ws);
        if (connections.get(testId)!.size === 0) {
          connections.delete(testId);
        }
      }
    });
  });

  // Broadcast progress updates to all subscribers for a test
  function broadcastProgress(event: ProgressEvent): void {
    const { testId } = event;
    
    if (connections.has(testId)) {
      const subscribers = connections.get(testId)!;
      const message = JSON.stringify(event);
      
      subscribers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // PROMPT TEST ROUTES
  
  // Create new prompt test
  app.post("/api/tests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const testSchema = z.object({
        promptText: z.string().min(1, "Prompt text is required"),
        desiredOutcome: z.string().min(1, "Desired outcome is required"),
        selectedModels: z.array(z.string()).min(1, "At least one model must be selected"),
        selectedFrameworks: z.array(z.string()).min(1, "At least one framework must be selected"),
        redTeamEnabled: z.boolean().optional(),
        iterationBudget: z.number().optional(),
      });

      const validatedData = testSchema.parse(req.body);

      const testData: InsertPromptTest = {
        userId: req.user!.id,
        promptText: validatedData.promptText,
        desiredOutcome: validatedData.desiredOutcome,
        redTeamEnabled: validatedData.redTeamEnabled || false,
      };

      const test = await storage.createPromptTest(testData);

      // In a real implementation, this would kick off an async job to run the prompt tests
      // For this implementation, we'll simulate progress and results with a timeout
      simulateTestExecution(test.id, validatedData.selectedModels, validatedData.selectedFrameworks);

      res.status(201).json(test);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  // Get recent tests for user
  app.get("/api/tests/recent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const tests = await storage.getPromptTestsByUserId(req.user!.id, 5);
      res.json(tests);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch recent tests" });
    }
  });

  // Get a specific test
  app.get("/api/tests/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const testId = parseInt(req.params.id);
      const test = await storage.getPromptTest(testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Check that the user owns this test or is an admin
      if (test.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(test);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Get test results
  app.get("/api/tests/:id/results", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const testId = parseInt(req.params.id);
      const test = await storage.getPromptTest(testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Check that the user owns this test or is an admin
      if (test.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const results = await storage.getPromptResults(testId);
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Update result quality (human override)
  app.patch("/api/results/:id/quality", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const resultId = parseInt(req.params.id);
      const { score } = req.body;
      
      // Validate score
      if (typeof score !== 'number' || score < 0 || score > 10) {
        return res.status(400).json({ message: "Score must be a number between 0 and 10" });
      }
      
      const updatedResult = await storage.updatePromptResultQuality(resultId, score);
      res.json(updatedResult);
    } catch (err) {
      res.status(500).json({ message: "Failed to update quality score" });
    }
  });

  // LIBRARY ROUTES
  
  // Save a prompt to library
  app.post("/api/library", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const saveSchema = z.object({
        testId: z.number(),
        name: z.string().min(1, "Name is required"),
        category: z.string().optional(),
        nextScheduled: z.string().optional().transform(val => val ? new Date(val) : undefined),
      });

      const validatedData = saveSchema.parse(req.body);
      
      // Ensure the test exists and belongs to the user
      const test = await storage.getPromptTest(validatedData.testId);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      if (test.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const saveData: InsertSavedPrompt = {
        userId: req.user!.id,
        testId: validatedData.testId,
        name: validatedData.name,
        category: validatedData.category || null,
        nextScheduled: validatedData.nextScheduled || null,
      };
      
      const savedPrompt = await storage.createSavedPrompt(saveData);
      res.status(201).json(savedPrompt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to save prompt" });
    }
  });
  
  // Get user's saved prompts
  app.get("/api/library", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const savedPrompts = await storage.getSavedPromptsByUserId(req.user!.id);
      res.json(savedPrompts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch saved prompts" });
    }
  });
  
  // Delete saved prompt
  app.delete("/api/library/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const promptId = parseInt(req.params.id);
      await storage.deleteSavedPrompt(promptId);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete saved prompt" });
    }
  });

  // ADMIN ROUTES
  
  // Get all frameworks
  app.get("/api/frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getFrameworks();
      res.json(frameworks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch frameworks" });
    }
  });
  
  // Update framework status (admin only)
  app.patch("/api/frameworks/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const frameworkId = parseInt(req.params.id);
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Enabled status must be a boolean" });
      }
      
      const updatedFramework = await storage.updateFramework(frameworkId, enabled);
      res.json(updatedFramework);
    } catch (err) {
      res.status(500).json({ message: "Failed to update framework" });
    }
  });
  
  // Get all red team attacks
  app.get("/api/red-team-attacks", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const attacks = await storage.getRedTeamAttacks();
      res.json(attacks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch red team attacks" });
    }
  });
  
  // Update red team attack status (admin only)
  app.patch("/api/red-team-attacks/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const attackId = parseInt(req.params.id);
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Enabled status must be a boolean" });
      }
      
      const updatedAttack = await storage.updateRedTeamAttack(attackId, enabled);
      res.json(updatedAttack);
    } catch (err) {
      res.status(500).json({ message: "Failed to update red team attack" });
    }
  });
  
  // Get all models
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });
  
  // Update model status (admin only)
  app.patch("/api/models/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const modelId = parseInt(req.params.id);
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Enabled status must be a boolean" });
      }
      
      const updatedModel = await storage.updateModel(modelId, enabled);
      res.json(updatedModel);
    } catch (err) {
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  // Function to simulate test execution for the MVP
  function simulateTestExecution(testId: number, modelIds: string[], frameworkIds: string[]) {
    // Create variants based on frameworks
    const variants = frameworkIds.map(id => ({ id, name: `Variant ${id}` }));
    // Add a baseline variant
    variants.unshift({ id: 'baseline', name: 'Baseline' });
    
    // Update test status to 'running'
    storage.updatePromptTestStatus(testId, 'running');
    
    // For each model and variant combination, simulate progress and results
    modelIds.forEach(modelId => {
      variants.forEach(variant => {
        simulateModelVariantExecution(testId, modelId, variant.id);
      });
    });
    
    // After all simulations are done, update the test status to 'completed'
    const totalSimulations = modelIds.length * variants.length;
    const simulationTime = 5000 + Math.random() * 15000; // 5-20 seconds
    
    setTimeout(async () => {
      await storage.updatePromptTestStatus(testId, 'completed');
      
      // Send final completion event
      broadcastProgress({
        type: 'test_completed',
        testId,
        modelId: '',
        variantId: '',
        progress: 100,
        message: 'Test completed',
      });
    }, simulationTime);
  }
  
  // Function to simulate execution for a single model+variant combination
  function simulateModelVariantExecution(testId: number, modelId: string, variantId: string) {
    let progress = 0;
    const firstTokenLatency = 200 + Math.random() * 300; // 200-500ms
    let totalTime = 0;
    
    // Initial progress update
    broadcastProgress({
      type: 'progress_update',
      testId,
      modelId,
      variantId,
      progress,
      message: 'Starting execution',
    });
    
    // Simulate first token latency
    setTimeout(() => {
      progress = 10;
      totalTime = firstTokenLatency;
      
      broadcastProgress({
        type: 'progress_update',
        testId,
        modelId,
        variantId,
        progress,
        message: 'First token received',
        firstTokenLatency,
      });
      
      // Now simulate the rest of the generation
      const interval = setInterval(async () => {
        progress += 10 + Math.floor(Math.random() * 15); // Add 10-25% progress each time
        totalTime += 100 + Math.random() * 200; // Add 100-300ms each time
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Generate a simulated quality score, cost, and vulnerability status
          const qualityScore = 6 + Math.random() * 4; // 6-10 score
          const costUsd = Math.floor((5 + Math.random() * 20) * 100) / 10000; // $0.005-$0.025
          
          // Randomly determine vulnerability status
          const vulnerabilityOptions = ['safe', 'partial', 'failed'];
          const vulnerabilityStatus = vulnerabilityOptions[Math.floor(Math.random() * vulnerabilityOptions.length)];
          
          // Sample output for the model
          const output = "I understand your concern about the billing discrepancy. Let me look into this for you.\n\nYour CloudTrack account shows that your base plan is indeed $49.99/month. The additional $10 charge is due to exceeding your plan's API request limit during the last billing cycle. According to our records, your account made approximately 12,500 API calls, while the standard plan includes 10,000 calls per month.\n\nThe overage is billed at $0.004 per additional request, which equals $10 for the 2,500 extra requests.\n\nI'd be happy to:\n1. Refund the overage charge this one time as a courtesy\n2. Help you monitor your API usage to avoid future overages\n3. Discuss upgrading to our Pro plan which includes 25,000 API calls for $69.99/month if you anticipate continued growth\n\nWould you like me to process the $10 refund for you? I can also set up email alerts when you reach 80% of your monthly API limit to help you avoid unexpected charges in the future.";
          
          // Create the final result in storage
          const resultData: InsertPromptResult = {
            testId,
            modelId,
            variantId,
            output,
            qualityScore: Math.round(qualityScore * 10) / 10, // Round to 1 decimal place
            latencyMs: Math.round(totalTime),
            costUsd: Math.round(costUsd * 10000), // Store as integer (micro-dollars)
            vulnerabilityStatus,
            metadata: { firstTokenLatency },
          };
          
          await storage.createPromptResult(resultData);
          
          // Send the final progress update with the result
          broadcastProgress({
            type: 'result_ready',
            testId,
            modelId,
            variantId,
            progress,
            message: 'Execution completed',
            totalTime,
            output,
            qualityScore: resultData.qualityScore,
            costUsd: resultData.costUsd,
            vulnerabilityStatus,
          });
        } else {
          // Send a progress update
          broadcastProgress({
            type: 'progress_update',
            testId,
            modelId,
            variantId,
            progress,
            message: 'Generating...',
            totalTime,
          });
        }
      }, 300 + Math.random() * 700); // 300-1000ms intervals
    }, firstTokenLatency);
  }

  return httpServer;
}
