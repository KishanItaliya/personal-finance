import { handlers } from "@/auth";
import { NextRequest } from "next/server";

console.log('Auth route handlers:', { 
  hasGetHandler: !!handlers.GET,
  hasPostHandler: !!handlers.POST
});

export const GET = async (req: NextRequest) => {
  console.log('Auth GET request:', { 
    url: req.url,
    method: req.method,
    nextUrl: req.nextUrl.toString()
  });
  try {
    return await handlers.GET(req);
  } catch (error) {
    console.error('Auth GET error:', error);
    throw error;
  }
};

export const POST = async (req: NextRequest) => {
  console.log('Auth POST request:', {
    url: req.url,
    method: req.method,
    nextUrl: req.nextUrl.toString()
  });
  try {
    return await handlers.POST(req);
  } catch (error) {
    console.error('Auth POST error:', error);
    throw error;
  }
};