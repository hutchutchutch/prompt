import { users, type User, type InsertUser } from "@shared/schema";
import { promptTests, type PromptTest, type InsertPromptTest } from "@shared/schema";
import { promptResults, type PromptResult, type InsertPromptResult } from "@shared/schema";
import { savedPrompts, type SavedPrompt, type InsertSavedPrompt } from "@shared/schema";
import { frameworks, type Framework, type InsertFramework } from "@shared/schema";
import { redTeamAttacks, type RedTeamAttack, type InsertRedTeamAttack } from "@shared/schema";
import { models, type Model, type InsertModel } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt Test methods
  createPromptTest(test: InsertPromptTest): Promise<PromptTest>;
  getPromptTest(id: number): Promise<PromptTest | undefined>;
  getPromptTestsByUserId(userId: number, limit?: number): Promise<PromptTest[]>;
  updatePromptTestStatus(id: number, status: string): Promise<PromptTest>;
  
  // Prompt Result methods
  createPromptResult(result: InsertPromptResult): Promise<PromptResult>;
  getPromptResults(testId: number): Promise<PromptResult[]>;
  updatePromptResultQuality(id: number, score: number): Promise<PromptResult>;
  
  // Saved Prompt methods
  createSavedPrompt(savedPrompt: InsertSavedPrompt): Promise<SavedPrompt>;
  getSavedPromptsByUserId(userId: number): Promise<SavedPrompt[]>;
  deleteSavedPrompt(id: number): Promise<void>;
  
  // Framework methods
  getFrameworks(): Promise<Framework[]>;
  updateFramework(id: number, enabled: boolean): Promise<Framework>;
  
  // RedTeam methods
  getRedTeamAttacks(): Promise<RedTeamAttack[]>;
  updateRedTeamAttack(id: number, enabled: boolean): Promise<RedTeamAttack>;
  
  // Model methods
  getModels(): Promise<Model[]>;
  updateModel(id: number, enabled: boolean): Promise<Model>;
  
  // Demo access method
  getDemoUser(): Promise<User | undefined>;
  
  // Session store
  sessionStore: any; // Using any type for session store to avoid import issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private promptTests: Map<number, PromptTest>;
  private promptResults: Map<number, PromptResult>;
  private savedPrompts: Map<number, SavedPrompt>;
  private frameworksMap: Map<number, Framework>;
  private redTeamAttacksMap: Map<number, RedTeamAttack>;
  private modelsMap: Map<number, Model>;
  
  currentUserId: number;
  currentPromptTestId: number;
  currentPromptResultId: number;
  currentSavedPromptId: number;
  currentFrameworkId: number;
  currentRedTeamAttackId: number;
  currentModelId: number;
  
  sessionStore: any; // Using any type for sessionStore to avoid typescript issues

  constructor() {
    this.users = new Map();
    this.promptTests = new Map();
    this.promptResults = new Map();
    this.savedPrompts = new Map();
    this.frameworksMap = new Map();
    this.redTeamAttacksMap = new Map();
    this.modelsMap = new Map();
    
    this.currentUserId = 1;
    this.currentPromptTestId = 1;
    this.currentPromptResultId = 1;
    this.currentSavedPromptId = 1;
    this.currentFrameworkId = 1;
    this.currentRedTeamAttackId = 1;
    this.currentModelId = 1;
    
    // Add a demo user
    const demoUser: User = {
      id: 999,
      username: 'demo_user',
      email: 'demo@promptlab.ai',
      password: 'hashed_password_not_usable',
      role: 'demo',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };
    this.users.set(demoUser.id, demoUser);
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize some default frameworks
    this.frameworksMap.set(this.currentFrameworkId++, {
      id: 1,
      name: "Baseline Framework",
      description: "Standard prompt testing without modifications",
      enabled: true,
    });
    this.frameworksMap.set(this.currentFrameworkId++, {
      id: 2,
      name: "Chain-of-Thought Framework",
      description: "Asks models to think step-by-step",
      enabled: true,
    });
    this.frameworksMap.set(this.currentFrameworkId++, {
      id: 3,
      name: "Few-Shot Framework",
      description: "Provides examples in prompt",
      enabled: false,
    });
    this.frameworksMap.set(this.currentFrameworkId++, {
      id: 4,
      name: "Self-Critique Framework",
      description: "Asks model to review its own output",
      enabled: true,
    });
    
    // Initialize some default red-team attacks
    this.redTeamAttacksMap.set(this.currentRedTeamAttackId++, {
      id: 1,
      name: "Prompt Injection",
      description: "Attempts to inject malicious instructions",
      numAttacks: 14,
      enabled: true,
      lastUpdated: new Date(),
    });
    this.redTeamAttacksMap.set(this.currentRedTeamAttackId++, {
      id: 2,
      name: "Jailbreak Attempts",
      description: "Attempts to bypass content policy",
      numAttacks: 8,
      enabled: true,
      lastUpdated: new Date(),
    });
    this.redTeamAttacksMap.set(this.currentRedTeamAttackId++, {
      id: 3,
      name: "Data Extraction",
      description: "Attempts to extract data from the model",
      numAttacks: 6,
      enabled: false,
      lastUpdated: new Date(),
    });
    
    // Initialize some default models
    this.modelsMap.set(this.currentModelId++, {
      id: 1,
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      inputCost: 10, // $0.01 per 1K tokens
      outputCost: 30, // $0.03 per 1K tokens
      enabled: true,
    });
    this.modelsMap.set(this.currentModelId++, {
      id: 2,
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      inputCost: 1.5, // $0.0015 per 1K tokens
      outputCost: 2, // $0.002 per 1K tokens
      enabled: true,
    });
    this.modelsMap.set(this.currentModelId++, {
      id: 3,
      name: "Claude 2",
      provider: "Anthropic",
      inputCost: 8, // $0.008 per 1K tokens
      outputCost: 24, // $0.024 per 1K tokens
      enabled: true,
    });
    this.modelsMap.set(this.currentModelId++, {
      id: 4,
      name: "Gemini Pro",
      provider: "Google",
      inputCost: 5, // $0.005 per 1K tokens
      outputCost: 15, // $0.015 per 1K tokens
      enabled: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: 'user', 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Prompt Test methods
  async createPromptTest(test: InsertPromptTest): Promise<PromptTest> {
    const id = this.currentPromptTestId++;
    const promptTest: PromptTest = {
      ...test,
      id,
      status: 'pending',
      createdAt: new Date(),
      completedAt: null,
    };
    this.promptTests.set(id, promptTest);
    return promptTest;
  }
  
  async getPromptTest(id: number): Promise<PromptTest | undefined> {
    return this.promptTests.get(id);
  }
  
  async getPromptTestsByUserId(userId: number, limit?: number): Promise<PromptTest[]> {
    const tests = Array.from(this.promptTests.values())
      .filter((test) => test.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? tests.slice(0, limit) : tests;
  }
  
  async updatePromptTestStatus(id: number, status: string): Promise<PromptTest> {
    const test = this.promptTests.get(id);
    if (!test) {
      throw new Error(`Prompt test with id ${id} not found`);
    }
    
    const updatedTest = {
      ...test,
      status,
      completedAt: status === 'completed' ? new Date() : test.completedAt,
    };
    
    this.promptTests.set(id, updatedTest);
    return updatedTest;
  }
  
  // Prompt Result methods
  async createPromptResult(result: InsertPromptResult): Promise<PromptResult> {
    const id = this.currentPromptResultId++;
    const promptResult: PromptResult = {
      ...result,
      id,
      createdAt: new Date(),
    };
    this.promptResults.set(id, promptResult);
    return promptResult;
  }
  
  async getPromptResults(testId: number): Promise<PromptResult[]> {
    return Array.from(this.promptResults.values())
      .filter((result) => result.testId === testId);
  }
  
  async updatePromptResultQuality(id: number, score: number): Promise<PromptResult> {
    const result = this.promptResults.get(id);
    if (!result) {
      throw new Error(`Prompt result with id ${id} not found`);
    }
    
    const updatedResult = {
      ...result,
      qualityScore: score,
    };
    
    this.promptResults.set(id, updatedResult);
    return updatedResult;
  }
  
  // Saved Prompt methods
  async createSavedPrompt(savedPrompt: InsertSavedPrompt): Promise<SavedPrompt> {
    const id = this.currentSavedPromptId++;
    const newSavedPrompt: SavedPrompt = {
      ...savedPrompt,
      id,
      createdAt: new Date(),
    };
    this.savedPrompts.set(id, newSavedPrompt);
    return newSavedPrompt;
  }
  
  async getSavedPromptsByUserId(userId: number): Promise<SavedPrompt[]> {
    return Array.from(this.savedPrompts.values())
      .filter((saved) => saved.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async deleteSavedPrompt(id: number): Promise<void> {
    if (!this.savedPrompts.has(id)) {
      throw new Error(`Saved prompt with id ${id} not found`);
    }
    
    this.savedPrompts.delete(id);
  }
  
  // Framework methods
  async getFrameworks(): Promise<Framework[]> {
    return Array.from(this.frameworksMap.values());
  }
  
  async updateFramework(id: number, enabled: boolean): Promise<Framework> {
    const framework = this.frameworksMap.get(id);
    if (!framework) {
      throw new Error(`Framework with id ${id} not found`);
    }
    
    const updatedFramework = {
      ...framework,
      enabled,
    };
    
    this.frameworksMap.set(id, updatedFramework);
    return updatedFramework;
  }
  
  // RedTeam methods
  async getRedTeamAttacks(): Promise<RedTeamAttack[]> {
    return Array.from(this.redTeamAttacksMap.values());
  }
  
  async updateRedTeamAttack(id: number, enabled: boolean): Promise<RedTeamAttack> {
    const attack = this.redTeamAttacksMap.get(id);
    if (!attack) {
      throw new Error(`Red team attack with id ${id} not found`);
    }
    
    const updatedAttack = {
      ...attack,
      enabled,
      lastUpdated: new Date(),
    };
    
    this.redTeamAttacksMap.set(id, updatedAttack);
    return updatedAttack;
  }
  
  // Model methods
  async getModels(): Promise<Model[]> {
    return Array.from(this.modelsMap.values());
  }
  
  async updateModel(id: number, enabled: boolean): Promise<Model> {
    const model = this.modelsMap.get(id);
    if (!model) {
      throw new Error(`Model with id ${id} not found`);
    }
    
    const updatedModel = {
      ...model,
      enabled,
    };
    
    this.modelsMap.set(id, updatedModel);
    return updatedModel;
  }
  
  // Demo access method
  async getDemoUser(): Promise<User | undefined> {
    return this.users.get(999); // Return the demo user with ID 999 if it exists
  }
}

export const storage = new MemStorage();
