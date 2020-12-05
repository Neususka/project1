from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
import random
import markdown2

from . import util


def index(request):
    if util.get_entry(request.GET.get("q")) is not None:
        return HttpResponseRedirect("/wiki/" + request.GET.get("q"))
    
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def index_geral(request, title):
    entries = util.list_entries()
    try: 
        return render(request, "encyclopedia/index_geral.html", {
            "content": markdown2.markdown(util.get_entry(title)),
            "title": title
        })
    except TypeError:
        return render(request, "encyclopedia/errorpage.html")


def index_search(request):
    title = request.GET['q']
    entries = util.list_entries()
    results = []

    for entry in entries:
        if title.lower() == entry.lower():
            return render(request, "encyclopedia/index_geral.html", {
                "content": markdown2.markdown(util.get_entry(title)),
                "title": title
            })
        if entry.lower().find(title.lower()) != -1:
            results.append(entry)
    
    return render(request, "encyclopedia/index_search.html", {
        "results": results
    })


def createnewpage(request):
    save_to_store = True
    entries = util.list_entries()
    if request.method == "POST":
        title = request.POST['title']
        content = request.POST['content']
        
        for entry in entries:
            if title.lower() == entry.lower():
                save_to_store = False
                break
        if save_to_store == True:
            util.save_entry(title.capitalize(), content)
            return render(request, "encyclopedia/index_geral.html", {
                "content": markdown2.markdown(util.get_entry(title)),
                "title": title
            })
        else:
            return HttpResponse ("Error: Entry already exists!")
    else:
        return render(request, "encyclopedia/createnewpage.html")


def editpage(request, title):
    if request.method == "POST":
        content = request.POST['content']    

        util.save_entry(title, content)
        return render(request, "encyclopedia/index_geral.html", {
            "content": markdown2.markdown(util.get_entry(title)),
            "title": title
        })
    else:
        return render(request, "encyclopedia/editpage.html", {
            "content": util.get_entry(title),
            "title": title
        })


def randomentry(request):
    title = random.choice(util.list_entries())
    return render(request, "encyclopedia/index_geral.html", {
        "content": markdown2.markdown(util.get_entry(title)),
        "title": title
    })