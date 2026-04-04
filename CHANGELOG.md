# Nexora Daily - Changelog

## [1.2.0] - 2026-04-04

### Added
- **Pro Daily Gift**: Premium users now receive a 50 Coin bonus every day.
- **Global Rankings**: Integrated a global leaderboard to show users their rank and performance tier.
- **New Challenges**: Added "Deep Meditation" and "Creative Writing" challenges.
- **Level-Up Rewards**: Users now receive 15 coins and a 5-streak bonus upon reaching a new level.
- **Pro Badge**: Added a visual "PRO" badge to the level indicator for premium users.

### Changed
- **Meditation for All**: Moved the "Deep Meditation" challenge to the free version (30s duration) and made it the final step of the daily flow.
- **Dynamic Level Map**: The level journey map now centers around the user's current level for better visibility.

### Fixed
- **AI Mascot**: Fixed an issue where the AI mascot couldn't retrieve the API key in the browser.
- **Gratitude Entries**: Fixed a bug where gratitude notes were not displaying the correct date.

## [1.1.1] - 2026-03-29

### Added
- **Shop Overhaul**: Lowered prices for all items (starting from 10 streaks) and added more variety of mascot skins (Viking, Ninja, Space, Detective).
- **Shop UI Improvements**: Added a "Featured Deal" section and categorized items into "Power-Ups" and "Mascot Styles" for better navigation.

## [1.1.0] - 2026-03-29

### Added
- **Pro Feature: Custom Challenge Goals**: Pro users can now customize their daily challenge count goal (from 3 up to 20) in the settings menu.
- **Enhanced Pro Section**: Clearer descriptions of Pro benefits and subscription plans (Weekly, Monthly, Yearly) to help users choose the best fit.
- **Custom Goal Adjusters**: Redesigned goal sliders in settings for a smoother experience.

### Changed
- **Daily Progress Logic**: The daily challenge limit now respects the user's `isPro` status and their custom `challengeCountGoal` setting.
- **Mascot AI**: Improved mascot advice relevance based on current progress and goals.

### Fixed
- **UI Consistency**: Fixed alignment issues in the settings screen when displaying Pro-only features.
- **Vibration Feedback**: Added consistent haptic feedback to new goal adjusters.
