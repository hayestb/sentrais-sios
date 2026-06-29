# NFLIT360 v8.3 Implementation Guide

## Phase 1: Backend API Updates

### New DynamoDB Tables Required

```typescript
// 1. Venue Certification Table
const VenueCertificationTable = {
  TableName: 'nflit360-venue-certifications',
  KeySchema: [
    { AttributeName: 'venueId', KeyType: 'HASH' },
    { AttributeName: 'certificationDate', KeyType: 'RANGE' }
  ],
  GlobalSecondaryIndexes: [
    { IndexName: 'by-status', KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }] }
  ]
};

// 2. User Certifications Table (EVERGAME360)
const UserCertificationTable = {
  TableName: 'nflit360-user-certifications',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' }
  ],
  GlobalSecondaryIndexes: [
    { IndexName: 'by-recert-date', KeySchema: [{ AttributeName: 'nextRecertification', KeyType: 'HASH' }] }
  ]
};

// 3. Issues Table (ITIL)
const IssuesTable = {
  TableName: 'nflit360-issues',
  KeySchema: [
    { AttributeName: 'issueId', KeyType: 'HASH' }
  ],
  GlobalSecondaryIndexes: [
    { IndexName: 'by-venue', KeySchema: [{ AttributeName: 'venueId', KeyType: 'HASH' }] },
    { IndexName: 'by-priority-status', KeySchema: [
      { AttributeName: 'priority', KeyType: 'HASH' },
      { AttributeName: 'status', KeyType: 'RANGE' }
    ]}
  ]
};
```

### New API Endpoints (add to server.ts)

```typescript
// ============================================
// V8.3 CONFIGURATION PORTAL ENDPOINTS
// ============================================

// Playbooks Management
server.get('/api/v1/playbooks', { preHandler: [requirePermission('playbooks:read')] },
  async (request, reply) => {
    // Return playbook inventory
});

server.post('/api/v1/playbooks/:playbookId/tasks', { preHandler: [requirePermission('playbooks:write')] },
  async (request, reply) => {
    // Add task to playbook (Admin only)
});

server.put('/api/v1/playbooks/:playbookId/tasks/:taskId', { preHandler: [requirePermission('playbooks:write')] },
  async (request, reply) => {
    // Update task (Admin only)
});

// User Management + EVERGAME360 Certification
server.get('/api/v1/users', { preHandler: [requirePermission('users:read')] },
  async (request, reply) => {
    // Return users with certification status
});

server.put('/api/v1/users/:userId/certification', { preHandler: [requirePermission('users:write')] },
  async (request, reply) => {
    // Update certification dates
});

server.get('/api/v1/users/recertification-alerts', { preHandler: [requirePermission('users:read')] },
  async (request, reply) => {
    // Return users needing recertification within 30 days
});

// Venue Certification Engine
server.get('/api/v1/venues', { preHandler: [requirePermission('venues:read')] },
  async (request, reply) => {
    // Return venues with certification/readiness state
});

server.get('/api/v1/venues/:venueId/checklist', { preHandler: [requirePermission('venues:read')] },
  async (request, reply) => {
    // Return certification checklist items
});

server.put('/api/v1/venues/:venueId/checklist/:itemId', { preHandler: [requirePermission('venues:write')] },
  async (request, reply) => {
    // Update checklist item status
});

server.get('/api/v1/venues/:venueId/punchlist', { preHandler: [requirePermission('venues:read')] },
  async (request, reply) => {
    // Return punchlist items
});

// Issues Management (ITIL)
server.get('/api/v1/issues', { preHandler: [requirePermission('issues:read')] },
  async (request, reply) => {
    // Return issues with filters (priority, status, venue, system)
});

server.post('/api/v1/issues', { preHandler: [requirePermission('issues:write')] },
  async (request, reply) => {
    // Create new issue
});

server.put('/api/v1/issues/:issueId/status', { preHandler: [requirePermission('issues:write')] },
  async (request, reply) => {
    // Update issue status (ITIL workflow)
});

// Evidence Engine
server.get('/api/v1/evidence', { preHandler: [requirePermission('evidence:read')] },
  async (request, reply) => {
    // Return evidence with filters
});

// NFL Exec Game Cards
server.get('/api/v1/games/week/:weekNumber', { preHandler: [requirePermission('games:read')] },
  async (request, reply) => {
    // Return game cards with readiness calculations
});

server.get('/api/v1/games/:gameId/detail', { preHandler: [requirePermission('games:read')] },
  async (request, reply) => {
    // Return detailed game info (gates, systems, issues)
});
```

## Phase 2: Frontend Deployment

### Option A: Vercel (Recommended for Web)

```bash
# 1. Create new branch for v8.3
git checkout -b feature/v8.3-config-portal

# 2. Copy the React component to your project
cp nflit360-v8.3.jsx src/App.jsx

# 3. Install dependencies (if not already present)
npm install react react-dom

# 4. Update package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

# 5. Push to GitHub
git add .
git commit -m "feat(v8.3): Configuration Portal - Admin experience redesign"
git push origin feature/v8.3-config-portal

# 6. Vercel auto-deploys from GitHub
# Preview URL: https://nflit-360-git-feature-v83-config-portal.vercel.app
```

### Option B: Manual Vercel Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from local
vercel --prod
```

## Phase 3: Mobile (React Native) Updates

### Update navigation structure

```typescript
// src/navigation/AppNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

// GDA Mobile - 3 tabs only
export function GDANavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Evidence" component={EvidenceScreen} />
    </Tab.Navigator>
  );
}
```

### Update Zustand stores

```typescript
// src/stores/taskStore.ts
import { create } from 'zustand';

interface TaskStore {
  tasks: Task[];
  completedCount: number;
  currentMilestone: string;
  toggleTask: (taskId: string) => void;
  fetchTasks: (systemId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  completedCount: 0,
  currentMilestone: 'M3',

  toggleTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId
          ? { ...t, status: t.status === 'complete' ? 'pending' : 'complete' }
          : t
      ),
      completedCount: state.tasks.filter(t => t.status === 'complete').length
    }));
  },

  fetchTasks: async (systemId) => {
    const response = await fetch(`/api/v1/playbooks/${systemId}/tasks`);
    const tasks = await response.json();
    set({ tasks, completedCount: tasks.filter(t => t.status === 'complete').length });
  }
}));
```

## Phase 4: AWS Infrastructure Updates

### CloudFormation additions

```yaml
# Add to existing CloudFormation template
Resources:
  # Venue Certifications Table
  VenueCertificationsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'nflit360-${Environment}-venue-certifications'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: venueId
          AttributeType: S
        - AttributeName: status
          AttributeType: S
      KeySchema:
        - AttributeName: venueId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: by-status
          KeySchema:
            - AttributeName: status
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  # User Certifications Table
  UserCertificationsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'nflit360-${Environment}-user-certifications'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: nextRecertification
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: by-recert-date
          KeySchema:
            - AttributeName: nextRecertification
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  # Issues Table
  IssuesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'nflit360-${Environment}-issues'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: issueId
          AttributeType: S
        - AttributeName: venueId
          AttributeType: S
        - AttributeName: priority
          AttributeType: S
        - AttributeName: status
          AttributeType: S
      KeySchema:
        - AttributeName: issueId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: by-venue
          KeySchema:
            - AttributeName: venueId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
        - IndexName: by-priority-status
          KeySchema:
            - AttributeName: priority
              KeyType: HASH
            - AttributeName: status
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
```

## Phase 5: Deployment Sequence

```bash
# 1. Deploy Infrastructure Updates
cd infrastructure
terraform plan -var="environment=prod"
terraform apply -var="environment=prod"

# 2. Deploy Backend API
cd ../backend
npm run build
docker build -t nflit360-api:v8.3 .
docker tag nflit360-api:v8.3 ${ECR_REPO}:v8.3
docker push ${ECR_REPO}:v8.3

aws ecs update-service \
  --cluster nflit360-prod \
  --service nflit360-api \
  --force-new-deployment

# 3. Deploy Frontend (Vercel)
git push origin main  # Auto-deploys to Vercel

# 4. Deploy Mobile (TestFlight/Play Store)
cd ../mobile
npx react-native build-ios --configuration Release
# Upload to TestFlight via Xcode
```

## Phase 6: Data Migration

### Seed venue certification data

```typescript
// scripts/seed-venue-certifications.ts
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const venues = [
  { venueId: 'arrowhead', name: 'Arrowhead Stadium', team: 'Kansas City Chiefs', certified: true },
  { venueId: 'att', name: 'AT&T Stadium', team: 'Dallas Cowboys', certified: true },
  // ... all 32 venues
];

async function seedVenues() {
  for (const venue of venues) {
    await docClient.send(new PutCommand({
      TableName: 'nflit360-prod-venue-certifications',
      Item: {
        ...venue,
        certificationDate: venue.certified ? '2025-08-01' : null,
        punchlistItems: 0,
        openIssues: 0,
        lastAudit: new Date().toISOString()
      }
    }));
  }
}
```

## Phase 7: Testing Checklist

| Test | Environment | Status |
|------|-------------|--------|
| Admin portal loads | Dev | ☐ |
| Playbook CRUD operations | Dev | ☐ |
| User certification updates | Dev | ☐ |
| Venue checklist management | Dev | ☐ |
| Issue creation/workflow | Dev | ☐ |
| NFL Exec game cards | Dev | ☐ |
| GDA task completion | Mobile | ☐ |
| Evidence capture/upload | Mobile | ☐ |
| Role-based access | All | ☐ |
| Sentrais lock enforcement | All | ☐ |
