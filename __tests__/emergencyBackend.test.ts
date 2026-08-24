import mongoose from 'mongoose';

// Mock mongoose models
jest.mock('../backend/src/models/EmergencyRequest', () => {
  const mockFind = jest.fn();
  const mockFindById = jest.fn();
  
  function MockEmergencyRequest(this: any, data: any) {
    this.userId = data.userId;
    this.type = data.type;
    this.status = data.status || 'PENDING';
    this.description = data.description;
    this._id = new mongoose.Types.ObjectId('64b7f8e8f8e8f8e8f8e8f8e8');
    this.save = jest.fn().mockResolvedValue(this);
  }
  
  (MockEmergencyRequest as any).find = mockFind;
  (MockEmergencyRequest as any).findById = mockFindById;
  (MockEmergencyRequest as any).index = jest.fn();
  
  return MockEmergencyRequest;
});

jest.mock('../backend/src/models/TrustedContact', () => {
  const mockFindOne = jest.fn();
  const mockDeleteOne = jest.fn();
  
  function MockTrustedContact(this: any, data: any) {
    this.userId = data.userId;
    this.name = data.name;
    this.phone = data.phone;
    this.relationship = data.relationship;
    this._id = new mongoose.Types.ObjectId('64b7f8e8f8e8f8e8f8e8f8f9');
    this.save = jest.fn().mockResolvedValue(this);
  }
  
  (MockTrustedContact as any).findOne = mockFindOne;
  (MockTrustedContact as any).deleteOne = mockDeleteOne;
  
  return MockTrustedContact;
});

const EmergencyRequest = require('../backend/src/models/EmergencyRequest');
const TrustedContact = require('../backend/src/models/TrustedContact');

const emergencyRouter = require('../backend/src/routes/emergency');
const trustedContactRouter = require('../backend/src/routes/trustedContact');

// Helper to find and extract the handler and middlewares of a router path
function getRouteStack(router: any, path: string, method: string) {
  const layer = router.stack.find(
    (l: any) => l.route && l.route.path === path && l.route.methods[method]
  );
  if (!layer) {
    throw new Error(`Route not found for path: ${path}, method: ${method}`);
  }
  return layer.route.stack.map((s: any) => s.handle);
}

describe('Backend Emergency & Trusted Contact APIs', () => {
  const mockUserId = '64b7f8e8f8e8f8e8f8e8f8ea';
  const otherUserId = '64b7f8e8f8e8f8e8f8e8f8eb';
  const mockAuthHeader = `Bearer ${mockUserId}`;

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('POST /emergency', () => {
    it('creates an emergency request for authenticated user', async () => {
      const stack = getRouteStack(emergencyRouter, '/', 'post');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.body = {
        type: 'MENTAL_HEALTH',
        description: 'User requested emergency mental health support',
      };

      // Run authentication middleware
      authMiddleware(req, res, next);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(mockUserId);

      // Run route handler
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 'PENDING',
        })
      );
    });

    it('rejects request with invalid emergency type', async () => {
      const stack = getRouteStack(emergencyRouter, '/', 'post');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.body = {
        type: 'INVALID_TYPE',
        description: 'Help needed',
      };

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid emergency type.' });
    });

    it('rejects request with empty description', async () => {
      const stack = getRouteStack(emergencyRouter, '/', 'post');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.body = {
        type: 'MENTAL_HEALTH',
        description: '',
      };

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Description is required.' });
    });

    it('rejects requests with no authentication token', async () => {
      const stack = getRouteStack(emergencyRouter, '/', 'post');
      const authMiddleware = stack[0];

      req.headers.authorization = undefined;

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized. No token provided.' });
    });
  });

  describe('GET /emergency/my-requests', () => {
    it('returns only the authenticated user\'s emergency requests', async () => {
      const stack = getRouteStack(emergencyRouter, '/my-requests', 'get');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;

      const mockRequests = [
        { _id: '1', userId: mockUserId, type: 'MEDICAL', status: 'PENDING' },
      ];
      EmergencyRequest.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRequests),
      });

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRequests);
      expect(EmergencyRequest.find).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });

  describe('PATCH /emergency/:id/status', () => {
    it('allows a user to update status of their own request', async () => {
      const stack = getRouteStack(emergencyRouter, '/:id/status', 'patch');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.params = { id: 'req_123' };
      req.body = { status: 'RESOLVED' };

      const mockRequest = {
        _id: 'req_123',
        userId: mockUserId,
        type: 'MEDICAL',
        status: 'PENDING',
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };
      EmergencyRequest.findById.mockResolvedValue(mockRequest);

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(mockRequest.status).toBe('RESOLVED');
      expect(mockRequest.save).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockRequest);
    });

    it('denies a user from updating another user\'s request status', async () => {
      const stack = getRouteStack(emergencyRouter, '/:id/status', 'patch');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.params = { id: 'req_123' };
      req.body = { status: 'RESOLVED' };

      const mockRequest = {
        _id: 'req_123',
        userId: otherUserId, // Owned by other user
        type: 'MEDICAL',
        status: 'PENDING',
        save: jest.fn(),
      };
      EmergencyRequest.findById.mockResolvedValue(mockRequest);

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden. You do not own this request.' });
      expect(mockRequest.save).not.toHaveBeenCalled();
    });

    it('rejects status updates with an invalid status', async () => {
      const stack = getRouteStack(emergencyRouter, '/:id/status', 'patch');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.params = { id: 'req_123' };
      req.body = { status: 'INVALID_STATUS' };

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid emergency status.' });
    });
  });

  describe('Trusted Contact APIs', () => {
    it('GET /trusted-contact returns 404 if no contact exists', async () => {
      const stack = getRouteStack(trustedContactRouter, '/', 'get');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      TrustedContact.findOne.mockResolvedValue(null);

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No trusted contact found.' });
    });

    it('POST /trusted-contact creates a contact strictly under the authenticated user', async () => {
      const stack = getRouteStack(trustedContactRouter, '/', 'post');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.body = {
        name: 'Jane Doe',
        phone: '0779998888',
        relationship: 'Spouse',
      };

      TrustedContact.findOne.mockResolvedValue(null);

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          contact: expect.objectContaining({
            userId: mockUserId,
            name: 'Jane Doe',
            phone: '0779998888',
            relationship: 'Spouse',
          }),
        })
      );
    });

    it('POST /trusted-contact fails if contact already exists', async () => {
      const stack = getRouteStack(trustedContactRouter, '/', 'post');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      req.body = {
        name: 'Jane Doe',
        phone: '0779998888',
        relationship: 'Spouse',
      };

      TrustedContact.findOne.mockResolvedValue({ userId: mockUserId });

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'A trusted contact already exists. Use PATCH to update it.',
      });
    });

    it('DELETE /trusted-contact removes the user\'s contact', async () => {
      const stack = getRouteStack(trustedContactRouter, '/', 'delete');
      const authMiddleware = stack[0];
      const handler = stack[1];

      req.headers.authorization = mockAuthHeader;
      TrustedContact.deleteOne.mockResolvedValue({ deletedCount: 1 });

      authMiddleware(req, res, next);
      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(TrustedContact.deleteOne).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });
});
