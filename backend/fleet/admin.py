from django.contrib import admin

from .models import Autocarro, Empresa, Motorista

admin.site.register(Empresa)
admin.site.register(Motorista)
admin.site.register(Autocarro)
