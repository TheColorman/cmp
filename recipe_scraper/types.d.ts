type Cousine = {
    id: string;
    type: string;
    name: string;
    slug: string;
    iconLink?: string;
    iconPath?: string;
    usage: number;
}

type AllergenID = string;
type Allergen = {
    id: AllergenID;
    name: string;
    type: string;
    slug: string;
    description?: string;
    iconLink?: string;
    iconPath?: string;
    triggersTracesOf: boolean;
    tracesOf: boolean;
    usage?: number;
}

type Category = {
    id: string;
    name: string;
    type: string;
    slug: string;
    iconLink?: string;
    iconPath?: string;
    usage: number;
}

type Family = {
    id: string;
    uuid: string;
    name: string;
    slug: string;
    type: string;
    description?: string;
    priority: number;
    iconLink?: string;
    iconPath?: string;
    usageByCountry: {
        [country: string]: number;
    };
    createdAt: string;
    updatedAt: string;
}

type IngredientID = string;
type Ingredient = {
    id: IngredientID;
    uuid: string;
    slug: string;
    type: string;
    country: string;
    imageLink?: string;
    imagePath?: string;
    name: string;
    internalName?: string;
    shipped: boolean;
    description?: string;
    usage: number;
    hasDuplicatedName?: boolean;
    allergens: AllergenID[];
    family: Family;
}

type Nutrition = {
    type: string;
    name: string;
    amount: number;
    unit: string;
}

type UtensilID = string;
type Utensil = {
    id: UtensilID;
    type?: string;
    name: string;
}

type Timer = {
    name: string;
    duration: string;
    temperature?: number;
    temperatureUnit?: string;
    ovenMode?: string;
}

type Step = {
    index: number;
    instructions: string;
    instructionsHTML: string;
    instructionsMarkdown: string;
    ingredients: IngredientID[];
    utensils: UtensilID[];
    timers: Timer[];
    images: {
        link: string;
        path: string;
        caption: string;
    }[];
    videos: unknown[];
}

type Preference = "EasyPlate" | "Quick \u0026 Easy"

type Tag = {
    id: string;
    type: string;
    name: string;
    slug: string;
    iconLink?: string;
    iconPath?: string;
    colorHandle?: string;
    preferences: Preference[];
    displayLabel: boolean;
    numberOfRecipes: number;
    numberOfRecipesByCountry: unknown[];
    isDeletable: boolean;
}

type Yield = {
    yields: number;
    ingredients: {
        id: IngredientID;
        amount?: number;
        unit?: string;
    }[];
}

type RecipeID = string;
type Recipe = {
    active: boolean;
    allergens: Allergen[];
    author?: string;
    averageRating?: number;
    canonical?: string;
    canonicalLink?: string;
    cardLink?: string;
    category?: Category;
    clonedFrom?: string;
    comment?: string;
    country: string;
    createdAt: string;
    cuisines: Cousine[];
    description: string;
    descriptionHTML: string;
    descriptionMarkdown: string;
    difficulty: number;
    favoritesCount: number;
    headline: string;
    highlighted: boolean;
    id: RecipeID;
    imageLink: string;
    imagePath: string;
    ingredients: Ingredient[];
    isAddon: boolean;
    isComplete?: boolean;
    isDinnerToLunch: boolean;
    isExcludedFromIndex: boolean;
    isPremium: boolean;
    label?: {
        text: string;
        handle: string;
        foregroundColor: string;
        backgroundColor: string;
        displayLabel: boolean;
    };
    link: string;
    marketplaceItems: unknown[];
    name: string;
    nutrition: Nutrition[];
    prepTime: string;
    promotion?: unknown;
    ratingsCount: number;
    seoDescription?: string;
    seoName?: string;
    servingSize: number;
    slug: string;
    steps: Step[];
    tags: Tag[];
    totalTime: string;
    uniqueRecipeCode?: string;
    updatedAt: string;
    utensils: Utensil[];
    uuid?: string;
    videoLink?: string;
    websiteUrl: string;
    wines: unknown[];
    yield: string;
    yields: Yield[];
}