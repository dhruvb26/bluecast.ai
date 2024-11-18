export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      hasAccess?: boolean;
      activeWorkspaceId?: string;
    };
  }
}
