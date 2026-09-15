# Arlene's Beans Menu Admin

Web-based CMS and control panel for the Arlene's Beans digital menu system.

## Initial architecture

- Admin UI: responsive web dashboard
- Source of truth: TEST Google Sheets during development
- Menu integration: Menu_Master, Functions, Options, Image Ticker, Categories and specialized control-panel sections
- Safety: read-only integration first; writes are enabled only after schema and synchronization validation
- Production menus are not modified during this phase

## Planned modules

1. Dashboard
2. Menu Master
3. Dish Editor / Add New Dish
4. Carousel Manager
5. Screen Manager
6. Features & Rules
7. Sync / validation engine
8. Authentication and audit history

## Data model

Every dish will use a stable Dish ID. The CMS will normalize the existing spreadsheet configuration behind a compatibility adapter so the current signage can continue working while the administration experience becomes simpler.
