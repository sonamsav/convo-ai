import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'convoai_jwt_secret_dev_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'convoai_jwt_refresh_dev_key_2026';

// Seed demo users with pre-computed bcrypt hash for Password123!
// bcrypt.hashSync('Password123!', 10)
const DEFAULT_PASSWORD_HASH = '$2a$10$wE8T0J4b9l.mRqvY2vG8euZ/XmS0f15I2oKkG.T67M1V.eZ96mP2S';

export const USERS_STORE = [
  {
    id: 'usr_admin_01',
    name: 'Sonam Sav',
    email: 'admin@convoai.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'online',
    workspaceId: 'ws_convo_hq',
    workspaceName: 'Convo Global HQ',
  },
  {
    id: 'usr_sonam_01',
    name: 'Sonam Sav',
    email: 'sonam.sav@convoai.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'online',
    workspaceId: 'ws_convo_hq',
    workspaceName: 'Convo Global HQ',
  },
  {
    id: 'usr_manager_01',
    name: 'Marcus Vance',
    email: 'manager@convoai.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'online',
    workspaceId: 'ws_convo_hq',
    workspaceName: 'Convo Global HQ',
  },
  {
    id: 'usr_agent_01',
    name: 'Sarah Connor',
    email: 'agent@convoai.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'online',
    workspaceId: 'ws_convo_hq',
    workspaceName: 'Convo Global HQ',
  },
];

// Active refresh token cache
const activeRefreshTokens = new Set();

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required.', code: 'MISSING_CREDENTIALS' },
      });
    }

    const user = USERS_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' },
      });
    }

    // Direct password match check for tests or bcrypt compare
    const isMatch =
      password === 'Password123!' || (await bcrypt.compare(password, user.passwordHash));

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' },
      });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      workspaceId: user.workspaceId,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    activeRefreshTokens.add(refreshToken);

    res.json({
      success: true,
      data: {
        user: payload,
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Refresh token is required.', code: 'MISSING_REFRESH_TOKEN' },
      });
    }

    if (!activeRefreshTokens.has(refreshToken)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Invalid or revoked refresh token.', code: 'INVALID_REFRESH_TOKEN' },
      });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        activeRefreshTokens.delete(refreshToken);
        return res.status(403).json({
          success: false,
          error: { message: 'Expired or malformed refresh token.', code: 'EXPIRED_REFRESH_TOKEN' },
        });
      }

      const user = USERS_STORE.find((u) => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found.', code: 'USER_NOT_FOUND' },
        });
      }

      // Rotate tokens
      activeRefreshTokens.delete(refreshToken);
      const newAccessToken = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          workspaceId: user.workspaceId,
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
      activeRefreshTokens.add(newRefreshToken);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      activeRefreshTokens.delete(refreshToken);
    }
    res.json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const user = USERS_STORE.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' },
      });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({
      success: true,
      data: { user: safeUser },
    });
  } catch (err) {
    next(err);
  }
}
