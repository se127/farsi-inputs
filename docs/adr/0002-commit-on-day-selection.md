# Commit the Selected date only when a day is picked

The Date field is read-only and the year and month controls change only the Viewed month. This keeps the field from ever holding a partial or invalid date: typing, masking, validation, and day clamping on month changes all disappear. The trade-off is that users cannot type or clear a date from the field, and changing the year or month does not update the field until a day is chosen. The Selected date lives in component state only; persistence and a clear affordance are out of scope.
