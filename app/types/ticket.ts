// Re-Export aus base-Layer für Inbox-Pages.
// Layer-Aliases (`~/types` in pflegeheime/patienten) zeigen jeweils
// auf den eigenen Layer, daher braucht app/ einen eigenen Re-Export.
export * from '../../layers/base/types/ticket'
