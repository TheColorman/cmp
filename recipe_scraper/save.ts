import DatabaseConstructor, { Database } from "better-sqlite3";
import { readFileSync, readdirSync } from 'fs';

class DB {
    db: Database;

    constructor() {
        this.db = new DatabaseConstructor("db.sqlite");
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");
        this.createTables();
    }
    createCousineTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS cuisines (
            id CHAR(36) PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            iconLink TEXT,
            iconPath TEXT,
            usage INTEGER NOT NULL
        )`)
            .run();
    }
    createAllergenTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS allergens (
            id CHAR(36) PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            slug TEXT NOT NULL,
            description TEXT,
            iconLink TEXT,
            iconPath TEXT,
            triggersTracesOf BOOLEAN NOT NULL,
            tracesOf BOOLEAN NOT NULL,
            usage INTEGER
        )`
            )
            .run();
    }
    createCategoryTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS categories(
            id CHAR(36) PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            slug TEXT NOT NULL,
            iconLink TEXT,
            iconPath TEXT,
            usage INTEGER NOT NULL
        )`
            )
            .run();
    }
    createFamilyTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS countries (
            code CHAR(2) PRIMARY KEY
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS families (
            id CHAR(36) PRIMARY KEY,
            uuid CHAR(36) NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            priority INTEGER NOT NULL,
            iconLink TEXT,
            iconPath TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS families_countries (
            familyId CHAR(36) NOT NULL,
            country CHAR(2) NOT NULL,
            PRIMARY KEY (familyId, country),
            FOREIGN KEY (familyId) REFERENCES families (id),
            FOREIGN KEY (country) REFERENCES countries (code)
        )`
            )
            .run();
    }
    createIngredientTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS ingredients (
            id CHAR(36) PRIMARY KEY,
            uuid CHAR(36) NOT NULL,
            slug TEXT NOT NULL,
            type TEXT NOT NULL,
            country CHAR(2) NOT NULL,
            imageLink TEXT,
            imagePath TEXT,
            name TEXT NOT NULL,
            internalName TEXT,
            shipped BOOLEAN NOT NULL,
            description TEXT,
            usage INTEGER NOT NULL,
            hasDuplicatedName BOOLEAN
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS ingredients_families (
            ingredientId CHAR(36) PRIMARY KEY,
            familyId CHAR(36) NOT NULL,
            FOREIGN KEY (ingredientId) REFERENCES ingredients (id),
            FOREIGN KEY (familyId) REFERENCES families (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS ingredients_allergens (
            ingredientId CHAR(36) NOT NULL,
            allergenId CHAR(36) NOT NULL,
            PRIMARY KEY (ingredientId, allergenId),
            FOREIGN KEY (ingredientId) REFERENCES ingredients (id),
            FOREIGN KEY (allergenId) REFERENCES allergens (id)
        )`
            )
            .run();
    }
    createNutritionTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS nutrition (
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            unit TEXT NOT NULL
        )`
            )
            .run();
    }
    createTagTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS preferences (
            name TEXT PRIMARY KEY
            )`).run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS tags (
            id CHAR(36) PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            iconLink TEXT,
            iconPath TEXT,
            colorHandle TEXT,
            displayLabel TEXT,
            numberOfRecipes INTEGER NOT NULL,
            isDeletable BOOLEAN NOT NULL
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS tags_preferences (
            tagId CHAR(36) NOT NULL,
            preferenceName TEXT NOT NULL,
            PRIMARY KEY (tagId, preferenceName),
            FOREIGN KEY (tagId) REFERENCES tags (id),
            FOREIGN KEY (preferenceName) REFERENCES preferences (name)
        )`
            )
            .run();
    }
    createRecipeTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes (
            active BOOLEAN NOT NULL,
            author TEXT,
            averageRating REAL,
            canonical TEXT,
            canonicalLink TEXT,
            cardLink TEXT,
            clonedFrom TEXT,
            comment TEXT,
            country TEXT,
            createdAt TEXT,
            description TEXT,
            descriptionHTML TEXT,
            descriptionMarkdown TEXT,
            difficulty INTEGER,
            favoritesCount INTEGER,
            headline TEXT,
            highlighted BOOLEAN,
            id CHAR(36) PRIMARY KEY,
            imageLink TEXT,
            imagePath TEXT,
            isAddon BOOLEAN,
            isComplete BOOLEAN,
            isDinnerToLunch BOOLEAN,
            isExcludedFromIndex BOOLEAN,
            isPremium BOOLEAN,
            link TEXT,
            name TEXT,
            prepTime TEXT,
            ratingsCount INTEGER,
            seoDescription TEXT,
            seoName TEXT,
            servingSize TEXT,
            slug TEXT,
            totalTime TEXT,
            uniqueRecipeCode TEXT,
            updatedAt TEXT,
            uuid TEXT,
            videoLink TEXT,
            websiteUrl TEXT,
            recipeYield TEXT
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_allergens (
            recipeId CHAR(36) NOT NULL,
            allergenId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, allergenId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (allergenId) REFERENCES allergens (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_category (
            recipeId CHAR(36) NOT NULL,
            categoryId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, categoryId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (categoryId) REFERENCES categories (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_cuisines (
            recipeId CHAR(36) NOT NULL,
            cuisineId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, cuisineId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (cuisineId) REFERENCES cuisines (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_ingredients (
            recipeId CHAR(36) NOT NULL,
            ingredientId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, ingredientId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (ingredientId) REFERENCES ingredients (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_nutrition (
            recipeId CHAR(36) NOT NULL,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            unit TEXT NOT NULL,
            PRIMARY KEY (recipeId, type, name),
            FOREIGN KEY (recipeId) REFERENCES recipes (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_tags (
            recipeId CHAR(36) NOT NULL,
            tagId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, tagId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (tagId) REFERENCES tags (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_utensils (
            recipeId CHAR(36) NOT NULL,
            utensilId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, utensilId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (utensilId) REFERENCES utensils (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_yields (
            recipeId CHAR(36) NOT NULL,
            yields INTEGER NOT NULL,
            ingredientId CHAR(36) NOT NULL,
            amount REAL,
            unit TEXT,
            PRIMARY KEY (recipeId, yields, ingredientId),
            FOREIGN KEY (recipeId) REFERENCES recipes (id),
            FOREIGN KEY (ingredientId) REFERENCES ingredients (id)
        )`
            )
            .run();
        
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS recipes_labels (
                    recipeId CHAR(36) PRIMARY KEY,
                    text TEXT NOT NULL,
                    handle TEXT NOT NULL,
                    foregroundColor TEXT NOT NULL,
                    backgroundColor TEXT NOT NULL,
                    displayLabel BOOLEAN NOT NULL,
                    FOREIGN KEY (recipeId) REFERENCES recipes (id)
                )`
            ).run();
    }
    createStepTable() {
        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS steps (
            recipeId CHAR(36) NOT NULL,
            stepIndex INTEGER NOT NULL,
            instructions TEXT NOT NULL,
            instructionsHTML TEXT NOT NULL,
            instructionsMarkdown TEXT NOT NULL,
            PRIMARY KEY (recipeId, stepIndex),
            FOREIGN KEY (recipeId) REFERENCES recipes (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS utensils (
            id CHAR(36) PRIMARY KEY,
            type TEXT,
            name TEXT NOT NULL
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS timers (
            name TEXT NOT NULL,
            duration TEXT NOT NULL,
            temperature REAL,
            temperatureUnit TEXT,
            ovenMode TEXT
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS steps_ingredients (
            recipeId CHAR(36) NOT NULL,
            stepIndex INTEGER NOT NULL,
            ingredientId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, stepIndex, ingredientId),
            FOREIGN KEY (recipeId, stepIndex) REFERENCES steps (recipeId, stepIndex),
            FOREIGN KEY (ingredientId) REFERENCES ingredients (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS steps_utensils (
            recipeId CHAR(36) NOT NULL,
            stepIndex INTEGER NOT NULL,
            utensilId CHAR(36) NOT NULL,
            PRIMARY KEY (recipeId, stepIndex, utensilId),
            FOREIGN KEY (recipeId, stepIndex) REFERENCES steps (recipeId, stepIndex),
            FOREIGN KEY (utensilId) REFERENCES utensils (id)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS steps_timers (
            recipeId CHAR(36) NOT NULL,
            stepIndex INTEGER NOT NULL,
            timerName TEXT NOT NULL,
            PRIMARY KEY (recipeId, stepIndex, timerName),
            FOREIGN KEY (recipeId, stepIndex) REFERENCES steps (recipeId, stepIndex)
        )`
            )
            .run();

        this.db
            .prepare(
                `CREATE TABLE IF NOT EXISTS steps_images (
            recipeId CHAR(36) NOT NULL,
            stepIndex INTEGER NOT NULL,
            link TEXT NOT NULL,
            path TEXT NOT NULL,
            caption TEXT NOT NULL,
            PRIMARY KEY (recipeId, stepIndex, link),
            FOREIGN KEY (recipeId, stepIndex) REFERENCES steps (recipeId, stepIndex)
        )`
            )
            .run();
    }
    createTables() {
        this.createCousineTable();
        this.createAllergenTable();
        this.createCategoryTable();
        this.createFamilyTable();
        this.createIngredientTable();
        this.createNutritionTable();
        this.createRecipeTable();
        this.createStepTable();
        this.createTagTable();
    }

    insertCuisine(data: Cousine) {
        const { iconLink, iconPath, ...rest } = data;
        const params = [
            rest.id,
            rest.type,
            rest.name,
            rest.slug,
            iconLink || null,
            iconPath || null,
            rest.usage,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO cuisines
                ( id, type, name, slug, iconLink, iconPath, usage )
            VALUES
                (?, ?, ?, ?, ?,?, ? )
        `).run(params);
    }
    insertAllergen(data: Allergen) {
        const { description, iconLink, iconPath, usage, ...rest } = data;
        const params = [
            rest.id,
            rest.name,
            rest.type,
            rest.slug,
            description || null,
            iconLink || null,
            iconPath || null,
            rest.triggersTracesOf ? 1 : 0,
            rest.tracesOf ? 1 : 0,
            usage || null,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO allergens
                ( id, name, type, slug, description, iconLink, iconPath, triggersTracesOf, tracesOf, usage )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(params);
    }
    insertCategory(data: Category) {
        const { iconLink, iconPath, ...rest } = data;
        const params = [
            rest.id,
            rest.name,
            rest.type,
            rest.slug,
            iconLink || null,
            iconPath || null,
            rest.usage,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO categories
                ( id, name, type, slug, iconLink, iconPath, usage )
            VALUES
                (?, ?, ?, ?, ?, ?, ?)
        `).run(params);
    }
    insertFamily(data: Family) {
        const { iconLink, iconPath, ...rest } = data;
        const params = [
            rest.id,
            rest.uuid,
            rest.name,
            rest.slug,
            rest.type,
            rest.description || null,
            rest.priority,
            iconLink || null,
            iconPath || null,
            rest.createdAt,
            rest.updatedAt,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO families
                ( id, uuid, name, slug, type, description, priority, iconLink, iconPath, createdAt, updatedAt )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(params);
        for (const country in rest.usageByCountry) {
            this.db.prepare(`
                INSERT OR REPLACE INTO countries
                    ( code )
                VALUES
                    (?)
            `).run([country]);
            this.db.prepare(`
                INSERT OR REPLACE INTO families_countries
                    ( familyId, country )
                VALUES
                    (?, ?)
            `).run([rest.id, country]);
        }
    }
    insertIngredient(data: Ingredient) {
        const { imageLink, imagePath, internalName, description } = data;
        const params = [
            data.id,
            data.uuid,
            data.slug,
            data.type,
            data.country,
            imageLink || null,
            imagePath || null,
            data.name,
            internalName || null,
            data.shipped ? 1 : 0,
            description || null,
            data.usage,
            data.hasDuplicatedName ? 1 : 0,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO ingredients
                ( id, uuid, slug, type, country, imageLink, imagePath, name, internalName, shipped, description, usage, hasDuplicatedName )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(params);
        for (const allergen of data.allergens) {
            this.db.prepare(`
                INSERT OR REPLACE INTO ingredients_allergens
                    ( ingredientId, allergenId )
                VALUES
                    (?, ?)
            `).run([data.id, allergen]);
        }
        this.insertFamily(data.family);
        this.db.prepare(`
            INSERT OR REPLACE INTO ingredients_families
                ( ingredientId, familyId )
            VALUES
                (?, ?)
        `).run([data.id, data.family.id]);
    }
    insertNutrition(data: Nutrition) {
        const params = [
            data.type,
            data.name,
            data.amount,
            data.unit,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO nutrition
                ( type, name, amount, unit )
            VALUES
                (?, ?, ?, ?)
        `).run(params);
    }
    insertUtensil(data: Utensil) {
        const { type } = data;
        const params = [
            data.id,
            type || null,
            data.name,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO utensils
                ( id, type, name )
            VALUES
                (?, ?, ?)
        `).run(params);
    }
    insertTimer(data: Timer) {
        const { temperature, temperatureUnit, ovenMode } = data;
        const params = [
            data.name,
            data.duration,
            temperature || null,
            temperatureUnit || null,
            ovenMode || null,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO timers
                ( name, duration, temperature, temperatureUnit, ovenMode )
            VALUES
                (?, ?, ?, ?, ?)
        `).run(params);
    }
    insertStep(data: Step, recipeId: RecipeID) {
        const params = [
            recipeId,
            data.index,
            data.instructions,
            data.instructionsHTML,
            data.instructionsMarkdown,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO steps
                ( recipeId, stepIndex, instructions, instructionsHTML, instructionsMarkdown )
            VALUES
                (?, ?, ?, ?, ?)
        `).run(params);

        for (const ingredentId of data.ingredients) {
            try {
                this.db.prepare(`
                INSERT OR REPLACE INTO steps_ingredients
                ( recipeId, stepIndex, ingredientId )
                VALUES
                (?, ?, ?)
                `).run([recipeId, data.index, ingredentId]);
            } catch (e) {
                if ((e as any).message.includes("FOREIGN KEY constraint failed")) {
                    console.log("Failed to insert ingredient", ingredentId, "for step", data.index, "of recipe", recipeId);
                }
            }
        }
        for (const utensilId of data.utensils) {
            this.db.prepare(`
                INSERT OR REPLACE INTO steps_utensils
                    ( recipeId, stepIndex, utensilId )
                VALUES
                    (?, ?, ?)
            `).run([recipeId, data.index, utensilId]);
        }
        for (const timer of data.timers) {
            this.insertTimer(timer);
            this.db.prepare(`
                INSERT OR REPLACE INTO steps_timers
                    ( recipeId, stepIndex, timerName )
                VALUES
                    (?, ?, ?)
            `).run([recipeId, data.index, timer.name]);
        }
        for (const image of data.images) {
            this.db.prepare(`
                INSERT OR REPLACE INTO steps_images
                    ( recipeId, stepIndex, link, path, caption )
                VALUES
                    (?, ?, ?, ?, ?)
            `).run([recipeId, data.index, image.link, image.path, image.caption]);
        }
    }
    insertTag(data: Tag) {
        const { iconLink, iconPath, colorHandle } = data;
        const params = [
            data.id,
            data.type,
            data.name,
            data.slug,
            iconLink || null,
            iconPath || null,
            colorHandle || null,
            data.displayLabel ? 1 : 0,
            data.numberOfRecipes,
            data.isDeletable ? 1 : 0,
        ];
        this.db.prepare(`
            INSERT OR REPLACE INTO tags
                ( id, type, name, slug, iconLink, iconPath, colorHandle, displayLabel, numberOfRecipes, isDeletable )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(params);
        
        for (const preference of data.preferences) {
            this.db.prepare(`
                INSERT OR REPLACE INTO preferences
                    ( name )
                VALUES
                    (?)
            `).run([preference]);
            this.db.prepare(`
                INSERT OR REPLACE INTO tags_preferences
                    ( tagId, preferenceName )
                VALUES
                    (?, ?)
            `).run([data.id, preference]);
        }
    }
    insertRecipe(data: Recipe) {
        const { author, averageRating, canonical, canonicalLink, cardLink, clonedFrom, comment, isComplete, seoDescription, seoName, uniqueRecipeCode, uuid, videoLink } = data;
        const params = [
            data.active ? 1 : 0,
            author || null,
            averageRating || null,
            canonical || null,
            canonicalLink || null,
            cardLink || null,
            clonedFrom || null,
            comment || null,
            data.country,
            data.createdAt,
            data.description,
            data.descriptionHTML,
            data.descriptionMarkdown,
            data.difficulty,
            data.favoritesCount,
            data.headline,
            data.highlighted ? 1 : 0,
            data.id,
            data.imageLink,
            data.imagePath,
            data.isAddon ? 1 : 0,
            isComplete == null ? null : (isComplete ? 1 : 0),
            data.isDinnerToLunch ? 1 : 0,
            data.isExcludedFromIndex ? 1 : 0,
            data.isPremium ? 1 : 0,
            data.link,
            data.name,
            data.prepTime,
            data.ratingsCount,
            seoDescription || null,
            seoName || null,
            data.servingSize,
            data.slug,
            data.totalTime,
            uniqueRecipeCode || null,
            data.updatedAt,
            uuid || null,
            videoLink || null,
            data.websiteUrl,
            data.yield,
        ];
        try {
            this.db.prepare(`
            INSERT OR REPLACE INTO recipes
            ( active, author, averageRating, canonical, canonicalLink, cardLink, clonedFrom, comment, country, createdAt, description, descriptionHTML, descriptionMarkdown, difficulty, favoritesCount, headline, highlighted, id, imageLink, imagePath, isAddon, isComplete, isDinnerToLunch, isExcludedFromIndex, isPremium, link, name, prepTime, ratingsCount, seoDescription, seoName, servingSize, slug, totalTime, uniqueRecipeCode, updatedAt, uuid, videoLink, websiteUrl, recipeYield )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(params);
        } catch (e) {
            console.log(data)
            throw e
        }

        for (const allergen of data.allergens) {
            this.insertAllergen(allergen);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_allergens
                    ( recipeId, allergenId )
                VALUES
                    (?, ?)
            `).run([data.id, allergen.id]);
        }
        if (data.category) {
            this.insertCategory(data.category);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_category
                    ( recipeId, categoryId )
                VALUES
                    (?, ?)
            `).run([data.id, data.category.id]);
        }
        if (data.label) {
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_labels
                    ( recipeId, text, handle, foregroundColor, backgroundColor, displayLabel )
                VALUES
                    (?, ?, ?, ?, ?, ?)
            `).run([data.id, data.label.text, data.label.handle, data.label.foregroundColor, data.label.backgroundColor, data.label.displayLabel ? 1 : 0]);
        }
        for (const cuisine of data.cuisines) {
            this.insertCuisine(cuisine);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_cuisines
                    ( recipeId, cuisineId )
                VALUES
                    (?, ?)
            `).run([data.id, cuisine.id]);
        }
        for (const ingredient of data.ingredients) {
            this.insertIngredient(ingredient);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_ingredients
                    ( recipeId, ingredientId )
                VALUES
                    (?, ?)
            `).run([data.id, ingredient.id]);
        }
        for (const nutrition of data.nutrition) {
            this.insertNutrition(nutrition);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_nutrition
                    ( recipeId, type, name, amount, unit )
                VALUES
                    (?, ?, ?, ?, ?)
            `).run([data.id, nutrition.type, nutrition.name, nutrition.amount, nutrition.unit]);
        }
        for (const utensil of data.utensils) {
            this.insertUtensil(utensil);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_utensils
                    ( recipeId, utensilId )
                VALUES
                    (?, ?)
            `).run([data.id, utensil.id]);
        }
        for (const step of data.steps) {
            try {
                this.insertStep(step, data.id);
            } catch (e) {
                console.log(data)
                throw e
            }
        }
        for (const tag of data.tags) {
            this.insertTag(tag);
            this.db.prepare(`
                INSERT OR REPLACE INTO recipes_tags
                    ( recipeId, tagId )
                VALUES
                    (?, ?)
            `).run([data.id, tag.id]);
        }
        for (const yield_ of data.yields) {
            for (const ingredient of yield_.ingredients) {
                this.db.prepare(`
                INSERT OR REPLACE INTO recipes_yields
                    ( recipeId, yields, ingredientId, amount, unit )
                VALUES
                    (?, ?, ?, ?, ?)
                `).run([data.id, yield_.yields, ingredient.id, ingredient.amount, ingredient.unit]);
            }
        }
    }
}

const db = new DB();

// Go through every json file in the recipes folder
const files = readdirSync("recipe_scraper/recipes");

const headstart = [0, 0]
for (let i = headstart[0]; i < files.length; i++) {
    const file = files[i];
    const data: Recipe[] = JSON.parse(readFileSync(`recipe_scraper/recipes/${file}`, "utf8"));
    for (let j = headstart[1]; j < data.length; j++) {
        console.log(`Inserting page ${i+1} / ${files.length} | recipe ${j+1} / ${data.length}`);
        db.insertRecipe(data[j]);
    }
    headstart[1] = 0;
}

// Close db before exiting
process.on("exit", () => {
    db.db.close();
});