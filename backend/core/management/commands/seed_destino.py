"""
Seed de dados iniciais: províncias de Angola, pontos turísticos,
empresa, autocarro, rotas e horários.
Uso: .venv/bin/python manage.py seed_destino
"""
from decimal import Decimal

from django.core.management.base import BaseCommand

from fleet.models import Autocarro, Empresa, Motorista
from routes.models import Horario, Rota
from tourism.models import PontoTuristico, Provincia

PROVINCIAS = [
    ("Luanda", "Luanda", "Capital económica de Angola, à beira do Atlântico."),
    ("Benguela", "Benguela", "Província costeira com forte herança colonial e praias."),
    ("Huambo", "Huambo", "Província das Planaltos Centrais, terra do Bie."),
    ("Huíla", "Lubango", "Serra da Leba, Fenda da Tundavala e planalto do Huíla."),
    ("Huambo Alta", "Kwanza Sul", None),  # placeholder evitado
    ("Kwanza Sul", "Sumbe", "Costa do Kwanza, praias e cachoeiras."),
    ("Kwanza Norte", "N'zeto", "Província do Kwanza Norte."),
    ("Cuanza Norte", "N'Dalatando", "Vale do Kwanza e Quedas de Kalandula (Malanje vizinha)."),
    ("Malanje", "Malanje", "Quedas de Kalandula — as maiores de Angola."),
    ("Cabinda", "Cabinda", "Exclave atlâmptico, praias e cultura congolesa."),
    ("Zaire", "Mbanza Congo", "Berço do Reino do Kongo."),
    ("Uíge", "Uíge", "Serra e culturas do norte."),
    ("Cunene", "Ondjiva", "Sul do país, cultura Cucuí e deserto do Iona."),
    ("Namibe", "Namibe", "Deserto do Namibe, Ponta do Pato e Tartarugas."),
    ("Cuando Cubango", "Menongue", "Savanas e Parque do Namibe/Onvingui."),
    ("Moxico", "Luena", "Largest province — plains and the Zambezi."),
    ("Lunda Norte", "Dundo", "Diamantes e cultura dos Tchokwe."),
    ("Lunda Sul", "Saurimo", "Portal das Lundas."),
]

# Corrigimos nomes corretos oficiais das 18 províncias
PROVINCIAS_OFICIAIS = [
    ("Bengo", "Caxito"),
    ("Benguela", "Benguela"),
    ("Bié", "Kuito"),
    ("Cabinda", "Cabinda"),
    ("Cuando Cubango", "Menongue"),
    ("Cuanza Norte", "N'Dalatando"),
    ("Cuanza Sul", "Sumbe"),
    ("Cunene", "Ondjiva"),
    ("Huambo", "Huambo"),
    ("Huíla", "Lubango"),
    ("Luanda", "Luanda"),
    ("Lunda Norte", "Dundo"),
    ("Lunda Sul", "Saurimo"),
    ("Malanje", "Malanje"),
    ("Moxico", "Luena"),
    ("Namibe", "Namibe"),
    ("Uíge", "Uíge"),
    ("Zaire", "Mbanza Congo"),
]

PONTOS = [
    ("Quedas de Kalandula", "malanje", "quedas",
     "Uma das maiores quedas de água de África Austral, com cerca de 105 m de altura.",
     "Kalandula", 0, True),
    ("Fenda da Tundavala", "huila", "montanha",
     "Fenda impressionante na Serra da Leba com vistas sobre o planalto do Huíla.",
     "Lubango", 0, True),
    ("Serra da Leba", "huila", "montanha",
     "Serra icônica com a estrada em zigue-zague e a Estátua da Leba.",
     "Lubango", 0, True),
    ("Parque Nacional da Kissama", "luanda", "parque",
     "Parque nacional a sul de Luanda, lar de elefantes, girafas e antílopes.",
     "Kissama", 5000, True),
    ("Ilha do Cabo", "luanda", "cultura",
     "Península com praias, fortes coloniais e vida noturna luandense.",
     "Luanda", 0, True),
    ("Marginal de Luanda", "luanda", "cultura",
     "Avenida à beira-mar com vistas para a Baixa de Luanda e a Fortaleza.",
     "Luanda", 0, False),
    ("Fortaleza de São Miguel", "luanda", "historia",
     "Fortaleza do século XVI com museu e vistas da baía de Luanda.",
     "Luanda", 1000, False),
    ("Praia Morena", "benguela", "praia",
     "Praia histórica do centro de Benguela, com areia dourada.",
     "Benguela", 0, True),
    ("Praia da Chiva", "benguela", "praia",
     "Praia tranquila a norte de Benguela, ideal para descanso.",
     "Benguela", 0, False),
    ("Museu Nacional da Escravatura", "luanda", "historia",
     "Museu dedicado à história da escravatura em Angola.",
     "Luanda", 2000, False),
    ("Cascata do Rio Dande", "bengo", "quedas",
     "Cachoeira pitoresca a norte de Luanda, fim de semana popular.",
     "Dande", 0, False),
    ("Quedas do Rio Mbridge", "cuanza-sul", "quedas",
     "Cachoeiras no vale do Kwanza, roteiro turístico do Kwanza Sul.",
     "Cuanza Sul", 0, False),
    ("Praia do Tessalove", "namibe", "praia",
     "Praia selvagem no deserto do Namibe, a sul de Namibe.",
     "Namibe", 0, True),
    ("Deserto do Iona", "namibe", "parque",
     "Reserva com dunas, vegetação xerófita e a Estátua da Mãe África do Deserto.",
     "Iona", 0, False),
    ("Parque do Bicuar", "benguela", "parque",
     "Parque nacional de savana com caça brava controlada.",
     "Benguela", 3000, False),
    ("Ruínas de M'banza Kongo", "zaire", "historia",
     "Capital do antigo Reino do Kongo, Património Mundial da UNESCO.",
     "Mbanza Congo", 0, True),
    ("Cabo Ledo", "cuanza-sul", "praia",
     "Praia de águas mornas a sul de Luanda, paraíso costeiro.",
     "Cabo Ledo", 0, True),
    ("Estátua do Bimbi", "uige", "cultura",
     "Miradouro e estátua com vista sobre a cidade do Uíge.",
     "Uíge", 0, False),
]


class Command(BaseCommand):
    help = "Popula a base de dados com dados iniciais do Destino"

    def handle(self, *args, **options):
        # Províncias
        provincias = {}
        for nome, capital in PROVINCIAS_OFICIAIS:
            slug = (
                nome.lower()
                .replace(" ", "-")
                .replace("'", "")
                .replace("é", "e")
                .replace("í", "i")
            )
            p, _ = Provincia.objects.get_or_create(
                nome=nome, defaults={"slug": slug, "capital": capital}
            )
            provincias[p.slug] = p
        # garantir slugs corretos
        for nome, capital in PROVINCIAS_OFICIAIS:
            slug = (
                nome.lower()
                .replace(" ", "-")
                .replace("'", "")
                .replace("é", "e")
                .replace("í", "i")
            )
            Provincia.objects.filter(nome=nome).update(slug=slug)
            provincias[slug] = Provincia.objects.get(nome=nome)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(provincias)} províncias"))

        # Pontos turísticos
        criados = 0
        for nome, slug_prov, cat, desc, ender, preco, destaque in PONTOS:
            prov = provincias.get(slug_prov)
            if not prov:
                continue
            _, created = PontoTuristico.objects.get_or_create(
                nome=nome,
                defaults={
                    "provincia": prov,
                    "categoria": cat,
                    "descricao": desc,
                    "endereco": ender,
                    "preco_entrada": Decimal(preco),
                    "destaque": destaque,
                    "slug": nome.lower().replace(" ", "-").replace("'", ""),
                },
            )
            criados += 1 if created else 0
        self.stdout.write(self.style.SUCCESS(f"✓ {criados} pontos turísticos"))

        # Empresa + frota
        empresa, _ = Empresa.objects.get_or_create(
            nome="Expresso Angola", defaults={"telefone": "+244 923 000 000"}
        )
        empresa2, _ = Empresa.objects.get_or_create(nome="Cubango Quiçama")
        motorista, _ = Motorista.objects.get_or_create(
            nome="João Manuel", defaults={"empresa": empresa, "telefone": "+244 912 111 222"}
        )
        ac1, _ = Autocarro.objects.get_or_create(
            matricula="LD-45-12-AB",
            defaults={
                "empresa": empresa,
                "modelo": "Mercedes-Benz O500",
                "classe": "executivo",
                "total_assentos": 44,
            },
        )
        ac2, _ = Autocarro.objects.get_or_create(
            matricula="BG-22-08-CD",
            defaults={
                "empresa": empresa2,
                "modelo": "Scania Touring",
                "classe": "conforto",
                "total_assentos": 50,
            },
        )
        self.stdout.write(self.style.SUCCESS("✓ 2 empresas, 1 motorista, 2 autocarros"))

        # Rotas principais
        rotas_def = [
            ("luanda", "huambo", empresa, 34000, 600, 560),
            ("luanda", "benguela", empresa, 38000, 720, 650),
            ("luanda", "huila", empresa2, 32000, 540, 520),
            ("luanda", "malanje", empresa, 18000, 240, 400),
            ("luanda", "namibe", empresa2, 45000, 900, 700),
            ("benguela", "huambo", empresa, 12000, 180, 350),
            ("huambo", "huila", empresa2, 10000, 150, 300),
        ]
        for o_slug, d_slug, emp, preco, dur, km in rotas_def:
            o, d = provincias.get(o_slug), provincias.get(d_slug)
            if not o or not d:
                continue
            rota, _ = Rota.objects.get_or_create(
                origem=o, destino=d, empresa=emp,
                defaults={
                    "preco_base": Decimal(preco),
                    "duracao_estimada_min": dur,
                    "distancia_km": Decimal(km),
                },
            )
            # Horários diários 07:00, 14:00, 21:00
            for hora, chegada in [("07:00", "17:00"), ("14:00", "00:00"), ("21:00", "07:00")]:
                Horario.objects.get_or_create(
                    rota=rota,
                    autocarro=ac1 if rota.empresa == empresa else ac2,
                    hora_saida=hora,
                    defaults={"hora_chegada": chegada, "preco": rota.preco_base},
                )
        self.stdout.write(self.style.SUCCESS(f"✓ {Rota.objects.count()} rotas, {Horario.objects.count()} horários"))
        self.stdout.write(self.style.SUCCESS("Seed concluído com sucesso!"))
