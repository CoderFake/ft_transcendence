from rest_framework.serializers import ModelSerializer, ValidationError
from rest_framework.fields import CharField
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.utils.translation import gettext as _


class UpdatePasswordSerializer(ModelSerializer):
    current_password = CharField(write_only=True, required=True)
    new_password = CharField(write_only=True, required=True)
    new_password2 = CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['current_password', 'new_password', 'new_password2']

    def validate_current_password(self, value):
        if not self.instance.check_password(value):
            raise ValidationError(_('Current password is incorrect.'))
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise ValidationError({'new_password2': _('The password does not match.')})
        return data

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.pk != instance.pk:
            raise ValidationError({'authorize': _('You dont have permission for this user.')})

        instance.set_password(validated_data['new_password'])

        instance.save()
        login(self.context['request'], instance)
        return instance
