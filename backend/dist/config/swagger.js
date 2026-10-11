import path from "path";
import { fileURLToPath } from "url";
import swaggerjsdoc from "swagger-jsdoc";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsPath = path.resolve(__dirname, "../docs/**/*.ts").replace(/\\/g, "/");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Nexo API",
            version: "1.0.0",
            description: "A professional e-commerce API built with Express, TS, and MongoDB",
            contact: {
                name: "Emad",
                url: "https://emad-site.vercel.app/",
                email: "emadahmeddev@gmail.com",
            },
            servers: [
                {
                    url: "http://localhost:5000/",
                },
            ],
        },
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
                name: "Orders",
                description: "Order processing and PayPal checkout APIs",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: [docsPath],
};
const spacs = swaggerjsdoc(options);
export default spacs;
//# sourceMappingURL=swagger.js.map