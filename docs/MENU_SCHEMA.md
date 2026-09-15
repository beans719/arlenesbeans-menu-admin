# Arlene's Beans — Menu Schema v0.1

This document defines the normalized vocabulary the CMS will use while remaining compatible with the existing TEST spreadsheet.

## Dish

| CMS field | Existing TEST concept | Purpose |
|---|---|---|
| `dish_id` | Menu_Master ID (example: M001) | Permanent unique identifier |
| `active` | Active | Controls visibility |
| `category` | Category / Categories | Menu grouping |
| `name` | Name | Display name |
| `description` | Description | Item description |
| `price` | Price | Base price |
| `variants` | Variants / Options | Size or item variants |
| `dietary` | Dietary | GF and other dietary metadata |
| `order` | Order | Sort position |
| `screen` | Screen | Target signage screen |
| `section` | Control-panel section | Placement within a screen |
| `proteins` | Specialized panel / Options | Protein choices |
| `addons` | Options / specialized configuration | Add-on choices |
| `chile_level` | Specialized menu configuration | Chile indicator behavior |
| `schedule` | Functions / section rules | Timed visibility |
| `image` | Image Ticker / future dish image | Associated media |

## Carousel image

Existing `Image Ticker` concepts will map to:

- `image_id`
- `active`
- `screen`
- `order`
- `image_url`
- `carousel_size`

## Feature

Existing `Functions` settings will be exposed through typed CMS controls instead of arbitrary spreadsheet editing. Known groups include ticker, layout, columns, dietary behavior, refresh, orientation and scale.

## Compatibility rule

The CMS must not invent alternate spreadsheet field names. New fields are added to this schema first, then mapped by the adapter.

## New dish workflow

1. Validate input.
2. Generate the next stable Dish ID.
3. Create/update the normalized Menu Master record.
4. Resolve screen and section.
5. Find a compatible existing configuration slot.
6. If no slot exists, create one from the section template/schema.
7. Register dependent options/proteins/add-ons.
8. Validate layout capacity without reducing font size automatically.
9. Commit the spreadsheet changes atomically where possible.
10. Trigger the existing lightweight menu change detection path.

## Development safety

Phase 1 is read-only against TEST. No production spreadsheet or production signage writes are allowed until the adapter and validation engine have been tested.
