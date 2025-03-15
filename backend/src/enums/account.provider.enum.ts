export const ProviderEnum={
    GOOGLE:"google",
    FACEBOOK:"facebook",
    GITHUB:"github",
    TWITTER:"twitter",
    EMAIL:"email"
}

export type ProviderEnumType = keyof typeof ProviderEnum;