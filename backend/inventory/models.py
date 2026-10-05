from django.db import models

class InventoryItem(models.Model):
    camp = models.ForeignKey(
        'camps.Camp',
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_items'
    )
    product_name = models.CharField(max_length=150)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, default='pcs')
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name} - {self.quantity} {self.unit} ({self.camp.name})"
