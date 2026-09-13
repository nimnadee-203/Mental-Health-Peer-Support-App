jest.mock('../backend/src/models/Post', () => {
  function MockPost(this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  }
  (MockPost as any).schema = {
    path: jest.fn().mockReturnValue({ options: { required: false } }),
  };
  return MockPost;
});

jest.mock('../backend/src/models/User', () => ({
  findById: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: '64b7f8e8f8e8f8e8f8e8f8ea' }) }),
}));

jest.mock('../backend/src/models/ModerationAudit', () => ({
  create: jest.fn().mockResolvedValue({ _id: 'audit-1' }),
}));

jest.mock('../backend/src/models/Report', () => ({
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../backend/src/models/Comment', () => ({}));

const postsRouter = require('../backend/src/routes/posts');
const moderationRouter = require('../backend/src/routes/moderation');
const ModerationAudit = require('../backend/src/models/ModerationAudit');

function getRouteStack(router: any, path: string, method: string) {
  const layer = router.stack.find(
    (item: any) => item.route && item.route.path === path && item.route.methods[method],
  );
  if (!layer) throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  return layer.route.stack.map((item: any) => item.handle);
}

function response() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('post author identity and moderation warnings', () => {
  it('stores the verified JWT user ID, never a body-supplied author ID', async () => {
    const handler = getRouteStack(postsRouter, '/group/:groupId', 'post').at(-1);
    const res = response();
    const req = {
      params: { groupId: 'group-1' },
      body: {
        content: 'A safe community post',
        topic: 'General',
        isAnonymous: true,
        authorId: '64b7f8e8f8e8f8e8f8e8f8eb',
      },
      user: { id: '64b7f8e8f8e8f8e8f8e8f8ea' },
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const createdPost = res.json.mock.calls[0][0];
    expect(createdPost.authorId).toBe(req.user.id);
  });

  it('records a warning only when the request has a moderator role', async () => {
    const stack = getRouteStack(moderationRouter, '/users/:id/warn', 'post');
    const requireRole = stack[1];
    const handler = stack[2];
    const res = response();
    const next = jest.fn();
    const req = {
      params: { id: '64b7f8e8f8e8f8e8f8e8f8ea' },
      body: { reason: 'Reported harmful content' },
      user: { id: '64b7f8e8f8e8f8e8f8e8f8ec', role: 'moderator' },
    };

    requireRole(req, res, next);
    await handler(req, res);

    expect(next).toHaveBeenCalled();
    expect(ModerationAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'WARN_USER',
        targetId: req.params.id,
        moderatorId: req.user.id,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('keeps authorId optional for legacy posts', () => {
    const Post = require('../backend/src/models/Post');
    const schema = Post.schema;
    expect(schema.path('authorId').options.required).not.toBe(true);
  });
});
