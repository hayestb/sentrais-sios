# NFLIT360 Backend Implementation Guide
## NestJS + PostgreSQL + Redis Architecture

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- AWS Account (S3)

### Project Initialization

```bash
# Create backend directory
mkdir backend && cd backend

# Initialize NestJS
npx @nestjs/cli new . --package-manager npm

# Install dependencies
npm install @nestjs/config @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install ioredis @nestjs/cache-manager cache-manager
npm install class-validator class-transformer
npm install bcrypt uuid

# Dev dependencies
npm install -D @types/passport-jwt @types/bcrypt
```

---

## Project Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── s3.config.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── decorators/
│   │   │       ├── roles.decorator.ts
│   │   │       └── current-user.decorator.ts
│   │   │
│   │   ├── games/
│   │   │   ├── games.module.ts
│   │   │   ├── games.controller.ts
│   │   │   ├── games.service.ts
│   │   │   ├── entities/
│   │   │   │   └── game.entity.ts
│   │   │   └── dto/
│   │   │       └── game.dto.ts
│   │   │
│   │   ├── playbooks/
│   │   │   ├── playbooks.module.ts
│   │   │   ├── playbooks.controller.ts
│   │   │   ├── playbooks.service.ts
│   │   │   ├── lock-state.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── playbook.entity.ts
│   │   │   │   └── override.entity.ts
│   │   │   └── dto/
│   │   │       └── playbook.dto.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── tasks.module.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── entities/
│   │   │   │   └── task.entity.ts
│   │   │   └── dto/
│   │   │       └── task.dto.ts
│   │   │
│   │   ├── issues/
│   │   │   ├── issues.module.ts
│   │   │   ├── issues.controller.ts
│   │   │   ├── issues.service.ts
│   │   │   ├── escalation.service.ts
│   │   │   ├── entities/
│   │   │   │   └── issue.entity.ts
│   │   │   └── dto/
│   │   │       └── issue.dto.ts
│   │   │
│   │   ├── assignments/
│   │   │   ├── assignments.module.ts
│   │   │   ├── assignments.controller.ts
│   │   │   ├── assignments.service.ts
│   │   │   ├── entities/
│   │   │   │   └── assignment.entity.ts
│   │   │   └── dto/
│   │   │       └── assignment.dto.ts
│   │   │
│   │   ├── evidence/
│   │   │   ├── evidence.module.ts
│   │   │   ├── evidence.controller.ts
│   │   │   ├── evidence.service.ts
│   │   │   ├── s3.service.ts
│   │   │   └── entities/
│   │   │       └── evidence.entity.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── venues/
│   │   │   ├── venues.module.ts
│   │   │   ├── venues.controller.ts
│   │   │   ├── venues.service.ts
│   │   │   └── entities/
│   │   │       └── venue.entity.ts
│   │   │
│   │   └── notifications/
│   │       ├── notifications.module.ts
│   │       ├── notifications.controller.ts
│   │       ├── notifications.service.ts
│   │       ├── notifications.gateway.ts
│   │       └── entities/
│   │           └── notification.entity.ts
│   │
│   └── shared/
│       ├── interceptors/
│       │   ├── logging.interceptor.ts
│       │   └── transform.interceptor.ts
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── pipes/
│       │   └── validation.pipe.ts
│       └── constants/
│           ├── lock-states.ts
│           └── roles.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── docker-compose.yml
└── package.json
```

---

## Core Implementations

### 1. Database Configuration

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  GDA
  GDA_SUPERVISOR
  CONTROL_ROOM
  NFL_OPS
}

enum LockState {
  UNLOCKED
  SOFT_LOCK
  HARD_LOCK
  CLOSED
}

enum TaskStatus {
  pending
  in_progress
  completed
  blocked
}

enum IssueSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IssueStatus {
  open
  in_progress
  escalated
  resolved
  closed
}

enum AssignmentStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
}

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  passwordHash   String
  name           String
  role           UserRole
  certifications Json         @default("[]")
  active         Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  assignments    Assignment[]
  tasksAssigned  Task[]       @relation("TaskAssignee")
  issuesReported Issue[]      @relation("IssueReporter")
  issuesAssigned Issue[]      @relation("IssueAssignee")
  evidence       Evidence[]
  notifications  Notification[]
}

model Venue {
  id           String   @id @default(uuid())
  code         String   @unique
  name         String
  city         String
  state        String
  timezone     String
  capacity     Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  games        Game[]
}

model Game {
  id           String   @id @default(uuid())
  nflGameId    String   @unique
  venueId      String
  homeTeam     String
  awayTeam     String
  kickoffTime  DateTime
  weekNumber   Int
  season       Int
  status       String   @default("SCHEDULED")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  venue        Venue    @relation(fields: [venueId], references: [id])
  playbook     Playbook?
  assignments  Assignment[]
  issues       Issue[]
}

model Playbook {
  id            String    @id @default(uuid())
  gameId        String    @unique
  templateId    String?
  name          String
  lockState     LockState @default(UNLOCKED)
  lockChangedAt DateTime?
  lockChangedBy String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  game          Game      @relation(fields: [gameId], references: [id])
  tasks         Task[]
  overrides     Override[]
}

model Task {
  id               String     @id @default(uuid())
  playbookId       String
  systemId         String
  title            String
  description      String?
  status           TaskStatus @default(pending)
  milestone        String?
  priority         String     @default("MEDIUM")
  evidenceRequired Boolean    @default(false)
  assignedToId     String?
  notes            String?
  startedAt        DateTime?
  completedAt      DateTime?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  playbook         Playbook   @relation(fields: [playbookId], references: [id])
  assignedTo       User?      @relation("TaskAssignee", fields: [assignedToId], references: [id])
  evidence         Evidence[]
}

model Issue {
  id                String        @id @default(uuid())
  gameId            String
  systemId          String
  title             String
  description       String?
  severity          IssueSeverity
  status            IssueStatus   @default(open)
  category          String
  reportedById      String
  assignedToId      String?
  resolution        Json?
  escalationHistory Json          @default("[]")
  slaDeadline       DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  game              Game          @relation(fields: [gameId], references: [id])
  reportedBy        User          @relation("IssueReporter", fields: [reportedById], references: [id])
  assignedTo        User?         @relation("IssueAssignee", fields: [assignedToId], references: [id])
  evidence          Evidence[]
}

model Assignment {
  id           String           @id @default(uuid())
  gameId       String
  userId       String
  systemId     String
  status       AssignmentStatus @default(PENDING)
  checkInTime  DateTime?
  checkOutTime DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  game         Game             @relation(fields: [gameId], references: [id])
  user         User             @relation(fields: [userId], references: [id])

  @@unique([gameId, userId, systemId])
}

model Evidence {
  id           String   @id @default(uuid())
  taskId       String?
  issueId      String?
  type         String
  filename     String
  s3Key        String
  uploadedById String
  createdAt    DateTime @default(now())

  task         Task?    @relation(fields: [taskId], references: [id])
  issue        Issue?   @relation(fields: [issueId], references: [id])
  uploadedBy   User     @relation(fields: [uploadedById], references: [id])
}

model Override {
  id           String   @id @default(uuid())
  playbookId   String
  taskId       String?
  status       String   @default("PENDING")
  requestedById String
  reason       String
  changes      Json
  approvals    Json     @default("[]")
  appliedAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  playbook     Playbook @relation(fields: [playbookId], references: [id])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  priority  String
  title     String
  body      String
  gameId    String?
  actionUrl String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}
```

### 2. Lock State Service

**src/modules/playbooks/lock-state.service.ts:**
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LockState } from '@prisma/client';

interface LockStateInfo {
  state: LockState;
  changedAt: Date | null;
  changedBy: string | null;
  overridesAllowed: boolean;
  requiresApproval: string[];
  editableFields: string[];
}

@Injectable()
export class LockStateService {
  private readonly LOCK_STATE_ORDER: LockState[] = [
    'UNLOCKED',
    'SOFT_LOCK',
    'HARD_LOCK',
    'CLOSED',
  ];

  private readonly LOCK_STATE_CONFIG: Record<LockState, Omit<LockStateInfo, 'state' | 'changedAt' | 'changedBy'>> = {
    UNLOCKED: {
      overridesAllowed: false,
      requiresApproval: [],
      editableFields: ['*'],
    },
    SOFT_LOCK: {
      overridesAllowed: true,
      requiresApproval: ['NFL_OPS'],
      editableFields: ['status', 'notes', 'evidence'],
    },
    HARD_LOCK: {
      overridesAllowed: true,
      requiresApproval: ['NFL_OPS', 'GDA_SUPERVISOR'],
      editableFields: ['evidence'],
    },
    CLOSED: {
      overridesAllowed: false,
      requiresApproval: [],
      editableFields: [],
    },
  };

  constructor(private prisma: PrismaService) {}

  getLockStateInfo(playbook: { lockState: LockState; lockChangedAt: Date | null; lockChangedBy: string | null }): LockStateInfo {
    const config = this.LOCK_STATE_CONFIG[playbook.lockState];
    return {
      state: playbook.lockState,
      changedAt: playbook.lockChangedAt,
      changedBy: playbook.lockChangedBy,
      ...config,
    };
  }

  canTransition(from: LockState, to: LockState): boolean {
    const fromIndex = this.LOCK_STATE_ORDER.indexOf(from);
    const toIndex = this.LOCK_STATE_ORDER.indexOf(to);

    // Can only move forward in lock states
    return toIndex > fromIndex;
  }

  async transitionLockState(
    playbookId: string,
    newState: LockState,
    changedBy: string,
  ) {
    const playbook = await this.prisma.playbook.findUnique({
      where: { id: playbookId },
    });

    if (!playbook) {
      throw new BadRequestException('Playbook not found');
    }

    if (!this.canTransition(playbook.lockState, newState)) {
      throw new BadRequestException(
        `Cannot transition from ${playbook.lockState} to ${newState}`,
      );
    }

    return this.prisma.playbook.update({
      where: { id: playbookId },
      data: {
        lockState: newState,
        lockChangedAt: new Date(),
        lockChangedBy: changedBy,
      },
    });
  }

  isEditAllowed(lockState: LockState, field: string): boolean {
    const config = this.LOCK_STATE_CONFIG[lockState];
    return (
      config.editableFields.includes('*') ||
      config.editableFields.includes(field)
    );
  }

  requiresOverride(lockState: LockState): boolean {
    return this.LOCK_STATE_CONFIG[lockState].overridesAllowed;
  }

  getRequiredApprovals(lockState: LockState): string[] {
    return this.LOCK_STATE_CONFIG[lockState].requiresApproval;
  }
}
```

### 3. Issue Escalation Service

**src/modules/issues/escalation.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IssueSeverity } from '@prisma/client';

interface SLAConfig {
  responseTime: number; // minutes
  resolutionTime: number; // minutes
  autoEscalate: boolean;
}

@Injectable()
export class EscalationService {
  private readonly SLA_CONFIG: Record<IssueSeverity, SLAConfig> = {
    CRITICAL: { responseTime: 5, resolutionTime: 30, autoEscalate: true },
    HIGH: { responseTime: 15, resolutionTime: 60, autoEscalate: true },
    MEDIUM: { responseTime: 30, resolutionTime: 120, autoEscalate: false },
    LOW: { responseTime: 60, resolutionTime: 240, autoEscalate: false },
  };

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  calculateSLADeadline(severity: IssueSeverity, createdAt: Date): Date {
    const config = this.SLA_CONFIG[severity];
    const deadline = new Date(createdAt);
    deadline.setMinutes(deadline.getMinutes() + config.resolutionTime);
    return deadline;
  }

  async escalateIssue(
    issueId: string,
    newSeverity: IssueSeverity,
    reason: string,
    escalatedBy: string,
  ) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: { game: true },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const escalationEntry = {
      previousSeverity: issue.severity,
      newSeverity,
      reason,
      escalatedBy,
      timestamp: new Date().toISOString(),
    };

    const history = issue.escalationHistory as any[];
    history.push(escalationEntry);

    const updated = await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        severity: newSeverity,
        status: 'escalated',
        escalationHistory: history,
        slaDeadline: this.calculateSLADeadline(newSeverity, new Date()),
      },
    });

    // Send notifications
    await this.notifications.broadcastToGame(issue.gameId, 'issue:escalated', {
      issueId,
      newSeverity,
      reason,
    });

    // Notify supervisors for critical issues
    if (newSeverity === 'CRITICAL') {
      await this.notifications.notifyRole('GDA_SUPERVISOR', {
        type: 'ISSUE_CREATED_CRITICAL',
        title: 'Critical Issue Escalated',
        body: `${issue.systemId}: ${issue.title}`,
        gameId: issue.gameId,
        priority: 'CRITICAL',
      });
    }

    return updated;
  }

  async checkSLABreaches() {
    const breachedIssues = await this.prisma.issue.findMany({
      where: {
        status: { in: ['open', 'in_progress', 'escalated'] },
        slaDeadline: { lt: new Date() },
      },
      include: { game: true },
    });

    for (const issue of breachedIssues) {
      if (this.SLA_CONFIG[issue.severity].autoEscalate) {
        const severities: IssueSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const currentIndex = severities.indexOf(issue.severity);

        if (currentIndex < severities.length - 1) {
          await this.escalateIssue(
            issue.id,
            severities[currentIndex + 1],
            'Auto-escalated due to SLA breach',
            'system',
          );
        }
      }
    }
  }
}
```

### 4. WebSocket Gateway

**src/modules/notifications/notifications.gateway.ts:**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);

      client.data.userId = payload.sub;

      // Track user's socket connections
      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub).add(client.id);

      // Join user's personal room
      client.join(`user:${payload.sub}`);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('subscribe:game')
  handleGameSubscription(client: Socket, gameId: string) {
    client.join(`game:${gameId}`);
    return { subscribed: true, gameId };
  }

  @SubscribeMessage('unsubscribe:game')
  handleGameUnsubscription(client: Socket, gameId: string) {
    client.leave(`game:${gameId}`);
    return { unsubscribed: true, gameId };
  }

  // Broadcast methods called by services
  broadcastToGame(gameId: string, event: string, data: any) {
    this.server.to(`game:${gameId}`).emit(event, data);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  broadcastToRole(role: string, event: string, data: any) {
    // This would need role->user mapping from database
    this.server.emit(`role:${role}:${event}`, data);
  }
}
```

### 5. S3 Evidence Service

**src/modules/evidence/s3.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3Client = new S3Client({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = config.get('AWS_S3_BUCKET');
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `evidence/${new Date().toISOString().split('T')[0]}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return { uploadUrl, key };
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });
  }
}
```

### 6. RBAC Guard

**src/modules/auth/guards/roles.guard.ts:**
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**src/modules/auth/decorators/roles.decorator.ts:**
```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

## Environment Variables

**.env.example:**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nflit360

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=nflit360-evidence

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: nflit360
      POSTGRES_PASSWORD: password
      POSTGRES_DB: nflit360
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://nflit360:password@postgres:5432/nflit360
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## Testing Strategy

### E2E Test Example

**test/playbooks.e2e-spec.ts:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Playbooks (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@nfl.com', password: 'password' });
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Lock State Transitions', () => {
    it('should allow UNLOCKED -> SOFT_LOCK', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/playbooks/test-playbook/lock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ state: 'SOFT_LOCK' });

      expect(res.status).toBe(200);
      expect(res.body.lockState).toBe('SOFT_LOCK');
    });

    it('should reject SOFT_LOCK -> UNLOCKED', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/playbooks/test-playbook/lock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ state: 'UNLOCKED' });

      expect(res.status).toBe(400);
    });
  });

  describe('Task Updates with Lock States', () => {
    it('should require override for HARD_LOCK updates', async () => {
      // Set playbook to HARD_LOCK first
      await request(app.getHttpServer())
        .put('/api/v1/playbooks/test-playbook/lock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ state: 'HARD_LOCK' });

      // Try to update task
      const res = await request(app.getHttpServer())
        .put('/api/v1/tasks/test-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PLAYBOOK_LOCKED');
    });
  });
});
```

---

## Migration from Mock API

### Step 1: Update Frontend API Client

Replace mock handlers with real API calls:

```typescript
// src/services/apiClient.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.token = localStorage.getItem('accessToken');
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...(data && { body: JSON.stringify(data) }),
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
      await this.refreshToken();
      return this.request(method, endpoint, data);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  // ... methods
}
```

### Step 2: Environment Configuration

```env
# .env.development (mock mode)
VITE_API_URL=http://localhost:5173
VITE_MOCK_API=true

# .env.production (real backend)
VITE_API_URL=https://api.nflit360.nfl.com
VITE_MOCK_API=false
```

---

## Deployment Checklist

1. [ ] PostgreSQL instance provisioned
2. [ ] Redis instance provisioned
3. [ ] S3 bucket created with CORS policy
4. [ ] Environment variables configured
5. [ ] Database migrations run
6. [ ] Seed data loaded
7. [ ] SSL certificates configured
8. [ ] Load balancer configured
9. [ ] WebSocket sticky sessions enabled
10. [ ] Monitoring/alerting set up
