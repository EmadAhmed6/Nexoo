import path from "path";
import { fileURLToPath } from "url";
import swaggerjsdoc from "swagger-jsdoc";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsExtension = path.extname(__filename) === ".ts" ? "ts" : "js";
const docsPath = path
    .resolve(__dirname, `../docs/**/*.${docsExtension}`)
    .replace(/\\/g, "/");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Nexo API",
            version: "1.0.0",
            description: "Nexo e-commerce REST API. Routes are mounted at the root (no /api/v1 prefix). Authenticated endpoints use a bearer access token; refresh sessions use an HTTP-only refreshToken cookie. General traffic is limited to 500 requests per IP per 15 minutes, with a 10-per-minute limit on sensitive authentication endpoints. See endpoint descriptions for roles, request formats, and payment callbacks.",
            contact: {
                name: "Emad",
                url: "https://emad-site.vercel.app/",
                email: "emadahmeddev@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server",
            },
        ],
        tags: [
            {
                name: "Auth",
                description: "Authentication APIs",
            },
            {
                name: "Users",
                description: "User management APIs",
            },
            {
                name: "Products",
                description: "Product management APIs",
            },
            {
                name: "Cart",
                description: "Shopping cart management APIs",
            },
            {
                name: "Wishlist",
                description: "Wishlist management APIs",
            },
            {
                name: "Orders",
                description: "Order processing and Paymob checkout APIs",
            },
            {
                name: "Coupons",
                description: "Coupons and discount management APIs",
            },
            {
                name: "Reviews",
                description: "Product reviews and ratings management APIs",
            },
            {
                name: "Notifications",
                description: "User notifications management APIs",
            },
            {
                name: "Tickets",
                description: "Support tickets and user assistance APIs",
            },
            {
                name: "Admin Orders",
                description: "Admin order management and fulfillment APIs",
            },
            {
                name: "Admin Tickets",
                description: "Admin support ticket management and status resolution APIs",
            },
            {
                name: "Banners",
                description: "Public promotional and hero banners APIs",
            },
            {
                name: "Admin Banners",
                description: "Admin banner management, upload, and scheduling APIs",
            },
            {
                name: "Admin Users",
                description: "Admin user moderation, banning, and account control APIs",
            },
            {
                name: "Admin Coupons",
                description: "Admin coupon management and discount campaign APIs",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                refreshCookie: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                    description: "HTTP-only refresh cookie set by authentication endpoints. Browsers send it automatically when credentials are included.",
                },
            },
        },
    },
    apis: [docsPath],
};
const spacs = swaggerjsdoc(options);
export default spacs;
//# sourceMappingURL=swagger.js.map