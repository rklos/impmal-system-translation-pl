# Licensed Foundry Tests

This directory is reserved for Playwright tests that require paid Imperium
Maledictum modules.

The licensed profile is not implemented. The Playwright configuration does not select
files from this directory, and the package bootstrap does not install paid modules.
Future licensed tests will use modules installed manually through Foundry Setup and
persisted in `.foundry/data`.
