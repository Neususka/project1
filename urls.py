from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("createnewpage", views.createnewpage, name="createnewpage"),
    path("edit/<str:title>", views.editpage, name="editpage"),
    path("randomentry", views.randomentry, name="randomentry"),
    path("searchpage", views.index_search, name="index_search"),
    path("<str:title>", views.index_geral, name="index_geral")
]


