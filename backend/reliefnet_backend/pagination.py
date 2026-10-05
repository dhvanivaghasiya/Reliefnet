from rest_framework.pagination import PageNumberPagination

class OptionalPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # Only paginate if 'page' query parameter is present, or if 'paginate' query parameter is set to 'true'.
        # Otherwise return None to bypass pagination and return a standard JSON list.
        paginate = request.query_params.get('paginate', '')
        if paginate.lower() != 'true' and 'page' not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view)
