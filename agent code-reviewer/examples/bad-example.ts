/**
 * Example: UserService with multiple SOLID violations
 * This file demonstrates issues the Code Reviewer will detect
 */

// ❌ ISSUE 1: Multiple responsibilities (SRP violation)
export class UserService {
  private users: Map<string, any> = new Map();
  private emailQueue: string[] = [];
  private logger: any = console;

  // ❌ Too many dependencies
  constructor(
    private db: any,
    private emailService: any,
    private cache: any,
    private analytics: any,
    private audit: any,
    private encryption: any,
    private validator: any,
    private mapper: any,
    private repository: any
  ) {}

  // ❌ ISSUE 2: God Method - does too many things
  async createUser(userData: any) {
    try {
      // Validate
      if (!userData.email) throw new Error('Email required');
      if (!userData.password) throw new Error('Password required');
      
      // Encrypt
      const encrypted = this.encryption.encrypt(userData.password);
      
      // Database
      const user = await this.db.insertUser({
        ...userData,
        password: encrypted
      });

      // Cache
      this.cache.set(`user:${user.id}`, user);

      // Email
      this.emailQueue.push(userData.email);
      await this.sendEmail(userData.email, 'Welcome!');

      // Analytics
      this.analytics.track('user.created', { userId: user.id });

      // Audit
      this.audit.log('User created', user.id);

      return user;
    } catch (error) {
      // ❌ ISSUE 3: Insufficient error handling
      console.log(error);
      throw error;
    }
  }

  // ❌ ISSUE 4: Direct implementation dependency (no abstraction)
  async sendEmail(email: string, message: string) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // ❌ ISSUE 5: Hardcoded secrets!
      auth: {
        user: 'admin@example.com',
        pass: 'password123'
      }
    });

    await transporter.sendMail({
      from: 'admin@example.com',
      to: email,
      subject: 'Notification',
      text: message
    });
  }

  // ❌ ISSUE 6: Deeply nested code (>4 levels)
  async updateUser(id: string, updates: any) {
    if (id) {
      if (updates) {
        if (updates.email) {
          if (this.validator.isEmail(updates.email)) {
            if (this.db) {
              if (this.cache) {
                const user = this.db.updateUser(id, updates);
                this.cache.set(`user:${id}`, user);
                return user;
              }
            }
          }
        }
      }
    }
    return null;
  }

  // ❌ ISSUE 7: N+1 query pattern (synchronous in async)
  async getAllUsers() {
    const users = this.db.getUsers();
    for (const user of users) {
      // Blocking sync operation in async function
      const details = require('fs').readFileSync(`./data/${user.id}.json`);
      user.details = details;
    }
    return users;
  }

  // ❌ ISSUE 8: Duplicate code
  async getUserById(id: string) {
    if (!id) throw new Error('ID required');
    if (typeof id !== 'string') throw new Error('Invalid ID');
    if (id.length === 0) throw new Error('Empty ID');
    return this.db.getUserById(id);
  }

  async getUserByEmail(email: string) {
    if (!email) throw new Error('Email required');
    if (typeof email !== 'string') throw new Error('Invalid email');
    if (email.length === 0) throw new Error('Empty email');
    return this.db.getUserByEmail(email);
  }

  // ❌ ISSUE 9: Global state mutation
  async deleteUser(id: string) {
    this.users.delete(id);
    this.emailQueue.push(`${id}@deleted`);
    await this.db.deleteUser(id);
  }

  // ❌ ISSUE 10: Eval usage
  async executeCustomLogic(code: string) {
    return eval(code); // CRITICAL SECURITY RISK!
  }
}
