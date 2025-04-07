import json
from os import listdir

from django.test import Client, TestCase
from django.contrib.staticfiles import finders

# Create your tests here.


class DictionnariesTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.directory = finders.find('js/lang/')

    def test_lang(self):
        keys = None
        keys_file = None

        json_files = listdir(self.directory)
        for file in json_files:
            with open(f'{self.directory}/{file}') as f:
                data: dict = json.load(f)
                if (keys is None):
                    keys = set(data.keys())
                    keys_file = file
                else:
                    self.assertEqual(set(data.keys()), keys, f'{file} differs from {keys_file}')
