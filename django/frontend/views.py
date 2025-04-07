from django.shortcuts import render

# Create your views here.


def index_view(req):
    return render(req, 'index.html')
