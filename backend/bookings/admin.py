from django.contrib import admin

from .models import Assento, Bilhete, Reserva

admin.site.register(Reserva)
admin.site.register(Assento)
admin.site.register(Bilhete)
