import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({root:"github-src",base:"/xianjian-a-share-ai/",plugins:[react()],build:{outDir:"../github-pages-dist",emptyOutDir:true}});
