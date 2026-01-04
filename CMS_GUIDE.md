# Contentful CMS Setup Guide

To update your portfolio dynamically without touching the code, we have integrated Contentful.

## 1. Create a Contentful Account
Go to [Contentful](https://www.contentful.com/) and create a free account. Create a new "Space" (e.g., "My Portfolio").

## 2. Get API Keys
1. In your Space, go to **Settings > API keys**.
2. Click **Add API key**.
3. Copy the **Space ID** and **Content Delivery API - access token**.
4. Create a `.env` file in the root of your project (or add to your hosting environment variables) with:
   ```
   VITE_CONTENTFUL_SPACE_ID=your_space_id_here
   VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
   ```

## 3. Create Content Models
You need to define the structure of your data in the **Content Model** tab.

### Model 1: Skill (`skill`)
*   **Name**: Skill
*   **API Identifier**: `skill`
*   **Fields**:
    *   **Title** (Text, Short) - e.g., "Frontend"
    *   **Languages** (List of Text) - e.g., "HTML", "CSS", "React"
    *   **Icon** (Media) - Upload the icon image.

### Model 2: Project (`project`)
*   **Name**: Project
*   **API Identifier**: `project`
*   **Fields**:
    *   **Name** (Text, Short) - e.g., "Martify"
    *   **Type** (Text, Short) - e.g., "e-commerce"
    *   **Description** (Text, Long)
    *   **Languages** (List of Text)
    *   **Github URL** (Text, URL)
    *   **Website URL** (Text, URL)
    *   **Media** (Media) - Screenshot or GIF.

### Model 3: Service (`service`)
*   **Name**: Service
*   **API Identifier**: `service`
*   **Fields**:
    *   **Title** (Text, Short) - e.g., "Designing"
    *   **Icon** (Media) - Upload the service icon.

## 4. Add Content
Go to the **Content** tab and start adding your skills, projects, and services! The site will automatically fetch this data.
