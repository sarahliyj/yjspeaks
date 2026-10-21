import { getProfile, skipProfileSetup, updateProfile } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { DomainError, errorResponse } from '@/lib/domain';

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const result = await getProfile(user);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser(request);
    const body = (await request.json()) as Record<string, unknown>;
    if (body.skip === true) {
      return Response.json(await skipProfileSetup(user));
    }

    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
    if (!displayName || displayName.length > 40) {
      throw new DomainError('INVALID_PROFILE', '名字需要为 1–40 个字符。');
    }
    if (bio.length > 160) throw new DomainError('INVALID_PROFILE', '简介最多 160 个字符。');
    if (avatarUrl.length > 1_500_000 || (avatarUrl && !isAllowedAvatar(avatarUrl))) {
      throw new DomainError('INVALID_PROFILE', '头像格式不受支持。');
    }

    return Response.json(await updateProfile(user, { displayName, bio, avatarUrl }));
  } catch (error) {
    return errorResponse(error);
  }
}

function isAllowedAvatar(value: string) {
  return /^https:\/\//i.test(value) || /^data:image\/(?:png|jpeg|webp);base64,/i.test(value);
}
