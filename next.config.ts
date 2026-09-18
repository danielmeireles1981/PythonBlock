import type { NextConfig } from "next";
const config: NextConfig = {
 poweredByHeader: false,
 async headers() { return [
  {source:"/(.*)",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"same-origin"}]},
  {source:"/((?!runner.html).*)",headers:[{key:"X-Frame-Options",value:"DENY"}]},
  {source:"/runner.html",headers:[{key:"Content-Security-Policy",value:"frame-ancestors 'self'"}]}
 ]; }
};
export default config;
