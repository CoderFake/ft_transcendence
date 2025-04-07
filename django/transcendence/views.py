from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

@api_view(('GET',))
def handler_404_view(request):
    return Response(status=status.HTTP_404_NOT_FOUND);
