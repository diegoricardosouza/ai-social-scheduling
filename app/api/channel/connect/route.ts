import { ChannelTypeEnum } from "@/constants/channels";
import { getInsforgeServerClient } from "@/lib/insforge-server";
import { getOAuthProvider } from "@/lib/social-oauth";
import { createPkcePair, getPkceCookieName } from "@/lib/social-oauth/pkce";
import { createOAuthState } from "@/lib/social-oauth/state";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(request: NextRequest) {
  try {
    const { insforge, userId } = await getInsforgeServerClient();
    if (!userId) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 401 })

    const { channelTypeId } = await request.json();
    if (!channelTypeId) return NextResponse.json({ error: "CHANNEL_TYPE_REQUIRED" }, { status: 400 });

    const { data: channelType, error } = await insforge.database
      .from("channel_types")
      .select("id, type")
      .eq("id", channelTypeId)
      .single();

    if (error || !channelType) return NextResponse.json({ error: "CHANNEL_TYPE_NOT_FOUND" }, { status: 404 });

    const redirectTo = `${APP_URL}/settings`;

    const provider = getOAuthProvider(channelType.type as ChannelTypeEnum);
    const state = createOAuthState({
      userId,
      channelTypeId: channelType.id,
      channelType: channelType.type,
      redirectTo
    });

    const callbackUrl = `${APP_URL}/api/channel/callback`

    const pkce = channelType.type === ChannelTypeEnum.TWITTER ?
      createPkcePair()
      : null

    const url = provider.getAuthorizationUrl({
      state,
      redirectUri: callbackUrl,
      codeChallenge: pkce?.codeChallenge,
      codeChallengeMethod: pkce?.codeChallengeMethod,
    })

    const response = NextResponse.json({ url })

    if (pkce) {
      response.cookies.set(getPkceCookieName(state), pkce.codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
      })
    }

    return response;

  } catch (error) {
    console.error('Error connecting channel:', error);
    return NextResponse.json({ error: "CONNECT_CHANNEL_FAILED" }, { status: 500 });
  }
}