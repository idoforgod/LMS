import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type { SignupRequest, SignupResponse } from './schema';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from './error';

/**
 * Create user account with auth, profile, and terms agreement
 */
export const createUserAccount = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, OnboardingServiceError, unknown>> => {
  // 1. Create auth account
  const { data: authData, error: authError } =
    await client.auth.admin.createUser({
      email: request.email,
      password: request.password,
      email_confirm: true,
    });

  if (authError) {
    if (
      authError.message.includes('already registered') ||
      authError.message.includes('already been registered')
    ) {
      return failure(
        409,
        onboardingErrorCodes.emailDuplicate,
        '이미 사용 중인 이메일입니다.',
      );
    }
    return failure(
      500,
      onboardingErrorCodes.authCreationFailed,
      authError.message,
    );
  }

  if (!authData.user) {
    return failure(
      500,
      onboardingErrorCodes.authCreationFailed,
      'Auth user creation failed.',
    );
  }

  const userId = authData.user.id;

  // 2. Create profile record
  const { error: profileError } = await client.from('profiles').insert({
    id: userId,
    role: request.role,
    name: request.name,
    phone: request.phone,
  });

  if (profileError) {
    await client.auth.admin.deleteUser(userId);
    return failure(
      500,
      onboardingErrorCodes.profileCreationFailed,
      profileError.message,
    );
  }

  // 3. Create terms agreement record
  const { error: termsError } = await client.from('terms_agreements').insert({
    user_id: userId,
  });

  if (termsError) {
    await client.from('profiles').delete().eq('id', userId);
    await client.auth.admin.deleteUser(userId);
    return failure(
      500,
      onboardingErrorCodes.termsAgreementFailed,
      termsError.message,
    );
  }

  // 4. Create session for the user
  const { data: sessionData, error: sessionError } =
    await client.auth.admin.generateLink({
      type: 'magiclink',
      email: request.email,
    });

  if (sessionError || !sessionData) {
    return failure(
      500,
      onboardingErrorCodes.tokenIssueFailed,
      'Session generation failed.',
    );
  }

  // 5. Return success response
  const response: SignupResponse = {
    token: sessionData.properties.hashed_token || '',
    user: {
      id: userId,
      email: request.email,
      role: request.role,
      name: request.name,
      phone: request.phone,
    },
  };

  return success(response, 201);
};
