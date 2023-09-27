"use strict";

import * as cheerio from "cheerio";
import { writeFileSync, readFileSync } from "fs";
import puppeteer from "puppeteer";
import { Browser } from "puppeteer";
import DatabaseConstructor, { Database } from "better-sqlite3";

class HelloFreshAPI {
    hfapi = "https://www.hellofresh.dk/gw";

    token: string;
    browser: Browser;

    private constructor(token: string, browser: Browser) {
        this.token = token;
        this.browser = browser;
    }
    static async init(token?: string) {
        const browser = await this.createBrowser();
        token ||= await this._getHelloFreshToken(browser);
        return new HelloFreshAPI(token, browser);
    }
    static async createBrowser() {
        return await puppeteer.launch({
            headless: true,
        });
    }
    static async _getHelloFreshToken(browser: Browser) {
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        const auths: Record<string, string>[] = [];
        page.on("request", (request) => {
            // Save requests with an Authorization header
            if (request.headers().authorization) {
                auths.push(request.headers());
            }
            request.continue();
        });
        await page.goto("https://www.hellofresh.dk/recipes");
        // Click on the first recipe
        await page.waitForSelector('[data-test-id="recipe-image-card"] a');
        const recipes = await page.$$('[data-test-id="recipe-image-card"] a');
        await recipes[0].click();
        // Wait for the recipe to load
        await page.waitForSelector('[data-test-id="recipe-description"]');
        await page.close();

        try {
            console.log(auths);
            return auths[0].authorization.split(" ")[1];
        } catch (error) {
            throw new Error("Could not get HelloFresh token from browser");
        }
    }
    saveToken() {
        writeFileSync("recipe_scraper/token.txt", this.token);
    }
    static loadToken() {
        try {
            return readFileSync("recipe_scraper/token.txt", "utf-8");
        } catch (error) {
            throw new Error("Could not load HelloFresh token from file");
        }
    }
    exit() {
        this.browser.close();
    }
    async _fetch(endpoint: string, params?: Record<string, string>) {
        const url = new URL(this.hfapi + endpoint);
        if (params) {
            url.search = new URLSearchParams(params).toString();
        }

        const res = await fetch(url.toString(), {
            headers: {
                authorization: `Bearer ${this.token}`,
            },
        });
        if (!res.ok) {
            throw new Error(
                `Could not fetch ${endpoint}: ${res.status} ${res.statusText}`
            );
        }
        return res.json();
    }

    async recipes() {
        const endpoint = "/recipes/recipes";
        const { total: totalRecipes } = await this._fetch(endpoint, {
            take: "1",
            country: "DK"
        });
        console.log(`Total recipes: ${totalRecipes}`);

        // Fetch in groups of 1000
        for (let skip = 0; skip < totalRecipes; skip += 1000) {
            console.log(`Fetching recipes ${skip} to ${skip + 1000} of ${totalRecipes}`);
            const { items: recipes } = await this._fetch(endpoint, {
                skip: skip.toString(),
                take: "1000",
                country: "DK"
            });
            writeFileSync(`recipe_scraper/recipes/recipes-${skip}.json`, JSON.stringify(recipes));
            
            // Wait 5 seconds between each fetch
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    async cuisines(): Promise<Cousine[]> {
        const endpoint = "/recipes/cuisines";
        const { items: cuisines } = await this._fetch(endpoint);
        return cuisines;
    }
}

let api: HelloFreshAPI;
try {
    const token = HelloFreshAPI.loadToken();
    api = await HelloFreshAPI.init(token);
} catch (error) {
    api = await HelloFreshAPI.init();
}

try {
    // api.saveToken();
    await api.recipes();

    api.exit();
} catch (e) {
    api.exit();
    throw e;
}
