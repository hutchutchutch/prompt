import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { InsertPromptTest, InsertPromptResult, InsertSavedPrompt, PromptResult, PromptTest } from "@shared/schema";
import { z } from "zod";
import { taskCategories, getCategoryByName } from "../client/src/data/task-categories";

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
  
  // Demo mode endpoint - one-click demo access
  app.post("/api/demo-login", async (req, res) => {
    try {
      // Get the fixed demo user from storage
      const demoUser = await storage.getDemoUser();
      
      if (!demoUser) {
        return res.status(404).json({ error: "Demo user not found" });
      }
      
      // Create a copy without the password for client response
      const demoUserResponse = {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        role: demoUser.role,
        createdAt: demoUser.createdAt
      };
      
      // Log in the user properly through passport
      req.login(demoUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Failed to authenticate demo user" });
        }
        
        // Mark the session with demo flag and user data for special handling and isolation
        req.session.isDemoMode = true;
        req.session.demoUser = demoUserResponse;
        
        // Set a short expiration (30 minutes) for demo sessions
        const thirtyMinutes = 30 * 60 * 1000;
        req.session.cookie.maxAge = thirtyMinutes;
        
        // Save the session explicitly to ensure it's stored
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Failed to save demo session" });
          }
          
          // Return the user info
          res.status(200).json(demoUserResponse);
        });
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Internal server error during demo login" });
    }
  });

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

  // ANALYTICS ROUTES
  
  // API endpoint for category-based KPI metrics
  app.get('/api/kpi', async (req, res) => {
    if (!isUserAuthorized(req)) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    // Demo KPI data for different categories
    const demoKpiData = {
      "Classification": {
        bestModel: { name: "GPT-4", quality: 9.4 },
        averageQuality: 8.1,
        averageCost: 0.07,
        averageSpeed: 782,
        deltas: { quality: 16, cost: -12, speed: 25 },
        metrics: ["Accuracy / Macro-F1", "Confusion matrix", "Schema conformance"]
      },
      "Summarization": {
        bestModel: { name: "Claude 3", quality: 9.1 },
        averageQuality: 7.9,
        averageCost: 0.05,
        averageSpeed: 1240,
        deltas: { quality: 15, cost: -8, speed: -15 },
        metrics: ["ROUGE-L", "Compression ratio", "Faithfulness"]
      },
      "Entity Extraction": {
        bestModel: { name: "GPT-4", quality: 9.3 },
        averageQuality: 8.4,
        averageCost: 0.08,
        averageSpeed: 920,
        deltas: { quality: 11, cost: -5, speed: 22 },
        metrics: ["Precision / Recall", "JSON validity", "Coverage"]
      },
      "Content Generation": {
        bestModel: { name: "Claude 3", quality: 9.0 },
        averageQuality: 7.7,
        averageCost: 0.11,
        averageSpeed: 1850,
        deltas: { quality: 17, cost: -20, speed: -10 },
        metrics: ["Relevance", "Originality", "Tone adherence"]
      },
      "Code Generation": {
        bestModel: { name: "Claude 3", quality: 8.9 },
        averageQuality: 7.8,
        averageCost: 0.09,
        averageSpeed: 1100,
        deltas: { quality: 14, cost: -15, speed: 8 },
        metrics: ["Test pass rate", "Compilation success", "Complexity"]
      },
      "Translation": {
        bestModel: { name: "GPT-4", quality: 9.2 },
        averageQuality: 8.0,
        averageCost: 0.06,
        averageSpeed: 980,
        deltas: { quality: 15, cost: -10, speed: 5 },
        metrics: ["BLEU/COMET", "Terminology accuracy", "Style"]
      },
      "Sentiment Analysis": {
        bestModel: { name: "GPT-4", quality: 9.5 },
        averageQuality: 8.3,
        averageCost: 0.04,
        averageSpeed: 550,
        deltas: { quality: 14, cost: -8, speed: 32 },
        metrics: ["Correlation with human", "Balanced accuracy", "Calibration"]
      },
      "Question Answering": {
        bestModel: { name: "Claude 3", quality: 9.3 },
        averageQuality: 8.2,
        averageCost: 0.08,
        averageSpeed: 890,
        deltas: { quality: 13, cost: -7, speed: 15 },
        metrics: ["Exact match", "Token-F1", "Answerability accuracy"]
      },
      "Data Analysis": {
        bestModel: { name: "Claude 3", quality: 8.8 },
        averageQuality: 7.5,
        averageCost: 0.12,
        averageSpeed: 1740,
        deltas: { quality: 17, cost: -22, speed: -12 },
        metrics: ["Insight correctness", "Statistical error rate", "Diversity"]
      },
      "Creative Writing": {
        bestModel: { name: "GPT-4", quality: 9.0 },
        averageQuality: 7.8,
        averageCost: 0.10,
        averageSpeed: 1520,
        deltas: { quality: 15, cost: -18, speed: -8 },
        metrics: ["Creativity rating", "Coherence", "Style fidelity"]
      }
    };
    
    try {
      // For demo purposes, return pre-defined KPI data based on category
      const categoryName = category as string;
      if (demoKpiData[categoryName as keyof typeof demoKpiData]) {
        return res.json({
          category: categoryName,
          ...demoKpiData[categoryName as keyof typeof demoKpiData],
          highVariance: Math.random() > 0.7, // Randomly set high variance flag
        });
      }
      
      // If no predefined data for this category, use the actual DB query
      const tests = await storage.getPromptTestsByCategory(categoryName);
      
      if (!tests || tests.length === 0) {
        return res.json({
          category,
          bestModel: { name: "N/A", quality: 0 },
          averageQuality: 0,
          averageCost: 0,
          averageSpeed: 0,
          deltas: { quality: 0, cost: 0, speed: 0 },
          isEmpty: true
        });
      }
      
      // Get results for these tests
      const testIds = tests.map(test => test.id);
      let allResults: PromptResult[] = [];
      
      for (const testId of testIds) {
        const results = await storage.getPromptResults(testId);
        allResults = [...allResults, ...results];
      }
      
      if (allResults.length === 0) {
        return res.json({
          category,
          bestModel: { name: "N/A", quality: 0 },
          averageQuality: 0,
          averageCost: 0,
          averageSpeed: 0,
          deltas: { quality: 0, cost: 0, speed: 0 },
          isEmpty: true
        });
      }
      
      // Calculate metrics
      // Find best model by quality
      const bestResult = [...allResults].sort((a, b) => 
        (b.qualityScore || 0) - (a.qualityScore || 0)
      )[0];
      
      // Calculate averages
      const totalQuality = allResults.reduce((sum, r) => sum + (r.qualityScore || 0), 0);
      const totalCost = allResults.reduce((sum, r) => sum + (r.costUsd || 0), 0);
      const totalSpeed = allResults.reduce((sum, r) => {
        const latency = r.totalTime || r.latencyMs || 0;
        return sum + latency;
      }, 0);
      
      const averageQuality = totalQuality / allResults.length;
      const averageCost = totalCost / allResults.length;
      const averageSpeed = totalSpeed / allResults.length / 1000; // Convert to seconds
      
      // Get all results for comparison
      const allCategoryResults = await storage.getAllPromptResults();
      
      // Calculate global averages (for all categories)
      const globalQuality = allCategoryResults.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / allCategoryResults.length;
      const globalCost = allCategoryResults.reduce((sum, r) => sum + (r.costUsd || 0), 0) / allCategoryResults.length;
      const globalSpeed = allCategoryResults.reduce((sum, r) => {
        const latency = r.totalTime || r.latencyMs || 0;
        return sum + latency;
      }, 0) / allCategoryResults.length / 1000;
      
      // Calculate deltas (as percentages)
      const qualityDelta = globalQuality > 0 ? ((averageQuality - globalQuality) / globalQuality) * 100 : 0;
      const costDelta = globalCost > 0 ? ((averageCost - globalCost) / globalCost) * 100 : 0;
      const speedDelta = globalSpeed > 0 ? ((averageSpeed - globalSpeed) / globalSpeed) * 100 : 0;
      
      // Check if there's high variance
      const qualityValues = allResults.map(r => r.qualityScore || 0);
      const qualityMean = totalQuality / allResults.length;
      const qualityVariance = qualityValues.reduce((sum, q) => sum + Math.pow(q - qualityMean, 2), 0) / allResults.length;
      const qualityStdDev = Math.sqrt(qualityVariance);
      const highVariance = (qualityStdDev / qualityMean) * 100 > 15;
      
      return res.json({
        category,
        bestModel: {
          name: bestResult.modelId,
          quality: bestResult.qualityScore || 0
        },
        averageQuality,
        averageCost,
        averageSpeed,
        deltas: {
          quality: qualityDelta,
          cost: costDelta,
          speed: speedDelta
        },
        highVariance
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      return res.status(500).json({ error: 'Failed to retrieve KPI data' });
    }
  });
  
  // API endpoint to get all available categories
  app.get('/api/categories', async (req, res) => {
    if (!isUserAuthorized(req)) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Categories used for classification (from the storage module)
      const categories = [
        'Classification',
        'Summarization',
        'Entity Extraction',
        'Code Generation',
        'Creative Writing',
        'Data Analysis',
        'Translation',
        'Question Answering',
        'Sentiment Analysis',
        'Paraphrasing'
      ];
      
      // Return the categories with additional metadata
      const response = categories.map(category => {
        return {
          category,
          description: getCategoryDescription(category),
          isNew: Math.random() < 0.3 // Randomly mark some categories as new for demo
        };
      });
      
      return res.json(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  });
  
  // Helper function to get category descriptions
  function getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'Classification': 'Assign inputs to predefined categories or classes',
      'Summarization': 'Create concise summaries of longer content',
      'Entity Extraction': 'Identify and extract entities like names, dates, and locations',
      'Code Generation': 'Generate functional code based on requirements',
      'Creative Writing': 'Create original stories, poems, and other creative content',
      'Data Analysis': 'Interpret data patterns and provide insights',
      'Translation': 'Convert text from one language to another',
      'Question Answering': 'Provide accurate answers to specific questions',
      'Sentiment Analysis': 'Determine the emotional tone of content',
      'Paraphrasing': 'Restate content in different words while preserving meaning',
    };
    
    return descriptions[category] || 'General prompt testing category';
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

  // Helper function to check if user is authenticated or in demo mode
  function isUserAuthorized(req: Express.Request): boolean {
    return req.isAuthenticated() || (req.session.isDemoMode === true && req.session.demoUser !== undefined);
  }
  
  // Helper function to get user ID (works for both regular and demo users)
  function getUserId(req: Express.Request): number {
    if (req.session.isDemoMode && req.session.demoUser) {
      return req.session.demoUser.id;
    }
    
    return req.user!.id;
  }
  
  // Helper function to check if user is in demo mode
  function isInDemoMode(req: Express.Request): boolean {
    return req.session.isDemoMode === true && req.session.demoUser !== undefined;
  }
  
  // Get recent tests for user
  app.get("/api/tests/recent", async (req, res) => {
    // Allow access without authentication for development and demo
    // In a production app, this would be protected

    try {
      // Return demo data for both non-authenticated users and the demo user (ID 999)
      if (!req.user || req.user.id === 999) {
        // Return demo data for the demo or non-authenticated users
        const demoData = [
          {
            id: 1001,
            userId: 999,
            promptText: "Classify this customer support email as urgent or non-urgent",
            desiredOutcome: "Accurate classification with explanation",
            status: "completed",
            redTeamEnabled: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000), // 30 seconds later
          },
          {
            id: 1002,
            userId: 999,
            promptText: "Extract key entities from this medical research abstract",
            desiredOutcome: "List of medical terms, conditions, treatments, and key findings",
            status: "completed",
            redTeamEnabled: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45000), // 45 seconds later
          },
          {
            id: 1003,
            userId: 999,
            promptText: "Summarize the key points from this quarterly earnings call transcript",
            desiredOutcome: "Brief summary with financial highlights and growth metrics",
            status: "completed",
            redTeamEnabled: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 60000), // 1 minute later
          },
          {
            id: 1004,
            userId: 999,
            promptText: "Generate a detailed API documentation for this code snippet",
            desiredOutcome: "Complete documentation with examples, parameters, and return values",
            status: "completed", 
            redTeamEnabled: false,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 50000), // 50 seconds later
          },
          {
            id: 1005,
            userId: 999,
            promptText: "Explain the concept of quantum computing to a high school student",
            desiredOutcome: "Simple explanation with metaphors and practical examples",
            status: "completed",
            redTeamEnabled: true,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
            completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 40000), // 40 seconds later
          }
        ];
        return res.json(demoData);
      }
      
      // For regular users, get data from storage
      const tests = await storage.getPromptTestsByUserId(req.user!.id, 5);
      res.json(tests);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch recent tests" });
    }
  });

  // Get a specific test
  app.get("/api/tests/:id", async (req, res) => {
    // Allow access without authentication for development and demo
    // In a production app, this would be protected

    try {
      const testId = parseInt(req.params.id);
      
      // Allow non-authenticated users and demo users to access demo data
      // In a production app, this would be protected
      if ((!req.user || req.user.id === 999) && testId >= 1001 && testId <= 1005) {
        // Return demo test data
        const demoTests = {
          1001: {
            id: 1001,
            userId: 999,
            promptText: "Classify this customer support email as urgent or non-urgent",
            desiredOutcome: "Accurate classification with explanation",
            status: "completed",
            redTeamEnabled: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000),
          },
          1002: {
            id: 1002,
            userId: 999,
            promptText: "Extract key entities from this medical research abstract",
            desiredOutcome: "List of medical terms, conditions, treatments, and key findings",
            status: "completed",
            redTeamEnabled: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45000),
          },
          1003: {
            id: 1003,
            userId: 999,
            promptText: "Summarize the key points from this quarterly earnings call transcript",
            desiredOutcome: "Brief summary with financial highlights and growth metrics",
            status: "completed",
            redTeamEnabled: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 60000),
          },
          1004: {
            id: 1004,
            userId: 999,
            promptText: "Generate a detailed API documentation for this code snippet",
            desiredOutcome: "Complete documentation with examples, parameters, and return values",
            status: "completed", 
            redTeamEnabled: false,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 50000),
          },
          1005: {
            id: 1005,
            userId: 999,
            promptText: "Explain the concept of quantum computing to a high school student",
            desiredOutcome: "Simple explanation with metaphors and practical examples",
            status: "completed",
            redTeamEnabled: true,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 40000),
          }
        };
        
        const demoTest = demoTests[testId as keyof typeof demoTests];
        if (demoTest) {
          return res.json(demoTest);
        }
      }
      
      // For regular users, get data from storage
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
    // Allow access without authentication for development and demo
    // In a production app, this would be protected

    try {
      const testId = parseInt(req.params.id);
      
      // Allow non-authenticated users and demo users to access demo data
      // In a production app, this would be protected
      if ((!req.user || req.user.id === 999) && testId >= 1001 && testId <= 1005) {
        // Return demo results based on the test type
        const getDemoResultsForTest = (testId: number) => {
          // Create results for 4 different models with 3 variants each
          const models = [
            { id: "gpt-4", name: "GPT-4 Turbo", provider: "OpenAI" },
            { id: "gpt-35", name: "GPT-3.5 Turbo", provider: "OpenAI" },
            { id: "claude-2", name: "Claude 2", provider: "Anthropic" },
            { id: "gemini-pro", name: "Gemini Pro", provider: "Google" }
          ];
          
          const variants = ["baseline", "cot", "self-critique"];
          const results = [];
          
          // Generate different quality scores based on the model and variant
          for (let i = 0; i < models.length; i++) {
            const model = models[i];
            for (let j = 0; j < variants.length; j++) {
              const variant = variants[j];
              
              // Quality scores are higher for more advanced models and better techniques
              const baseQuality = 6.5 + (2.5 * (models.length - i) / models.length);
              const variantBonus = j * 0.7;  // Better variant means higher score
              const qualityScore = Math.min(10, baseQuality + variantBonus);
              
              // Cost is higher for advanced models
              const costScale = (i + 1) / models.length;
              const costUsd = 0.005 + (0.045 * costScale);
              
              // Latency is lower for simpler models
              const baseLatency = 2000;
              const modelLatency = baseLatency * (1 + i * 0.5);
              const variantLatency = baseLatency * (1 + j * 0.3);
              const latencyMs = modelLatency + variantLatency;
              
              results.push({
                id: 1000 + (i * 10) + j,
                testId,
                modelId: model.id,
                variantId: variant,
                output: `Sample output for ${model.name} using ${variant} variant. This demonstrates the quality of response you would get from this model and approach.`,
                qualityScore,
                latencyMs,
                costUsd,
                vulnerabilityStatus: testId % 2 === 0 ? 'safe' : (i === 0 ? 'partial' : 'safe'),
                metadata: {
                  modelProvider: model.provider,
                  modelName: model.name,
                  variantName: variant === "baseline" ? "Baseline" : variant === "cot" ? "Chain-of-Thought" : "Self-Critique",
                },
                createdAt: new Date(Date.now() - (Math.random() * 24 * 60 * 60 * 1000)),
              });
            }
          }
          
          return results;
        };
        
        return res.json(getDemoResultsForTest(testId));
      }
      
      // For regular users, get data from storage
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
      // Check if this is the demo user
      if (req.user!.id === 999) {
        // Return demo data for the demo user
        const demoLibrary = [
          {
            id: 2001,
            userId: 999,
            testId: 1001,
            name: "Customer Support Classification",
            category: "Classification",
            nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 2002,
            userId: 999,
            testId: 1002,
            name: "Medical Entity Extraction",
            category: "Entity Extraction",
            nextScheduled: null,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 2003,
            userId: 999,
            testId: 1003,
            name: "Financial Report Summary",
            category: "Summarization",
            nextScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
        ];
        return res.json(demoLibrary);
      }
      
      // For regular users, get data from storage
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
      // For demo user, return pre-set frameworks
      if (req.isAuthenticated() && req.user!.id === 999) {
        const demoFrameworks = [
          {
            id: 1,
            name: "Chain-of-Thought",
            description: "Instructs the model to break down its reasoning step-by-step",
            enabled: true,
            lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            id: 2,
            name: "Self-Critique",
            description: "Models evaluate their own outputs and refine their answers",
            enabled: true,
            lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: 3,
            name: "Tree-of-Thought",
            description: "Explores multiple reasoning paths simultaneously",
            enabled: true,
            lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: 4,
            name: "Few-Shot Learning",
            description: "Provides examples in the prompt to guide the model response",
            enabled: true,
            lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          }
        ];
        return res.json(demoFrameworks);
      }
      
      // For regular users, get data from storage
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
