from django.contrib import admin

from .models import User

admin.site.register(User)
admin.site.site_header = "Destino — Admin"
admin.site.site_title = "Destino Admin"
admin.site.index_title = "Gestão da plataforma Destino"
