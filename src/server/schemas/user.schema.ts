import { z } from 'zod';

// FEAT-0: User validation schemas

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(50, '닉네임은 50자 이하여야 합니다')
    .optional(),
  profileImage: z.string().url('올바른 URL 형식이 아닙니다').nullable().optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
