from django.urls import path

from .views import register, login, logout, delete, logged, update_profile, update_password

urlpatterns = [
    path("register", register.RegisterView.as_view(), name="register"),
    path("login", login.LoginView.as_view(), name="login"),
    path("logout", logout.LogoutView.as_view(), name="logout"),
    path("logged", logged.LoggedView.as_view(), name="logged"),
    path("delete", delete.DeleteView.as_view(), name="delete"),
    path('update_profile', update_profile.UpdateProfileView.as_view(), name='update_profile'),
    path('update_password', update_password.UpdatePasswordView.as_view(), name='update_password')
]
