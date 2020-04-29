import unittest
import os
import traceback
from multiprocessing import Value
import nose2
import time
from functions.Collections import create_customer
from functions.Collections import create_subscriber
from functions.Collections import create_domain
from functions.Collections import delete_subscriber
from functions.Collections import delete_domain
from functions.Collections import login_csc
from functions.Collections import login_panel
from functions.Collections import logout_csc
from functions.Functions import click_js
from functions.Functions import create_driver
from functions.Functions import fill_element
from functions.Functions import step
from functions.Functions import wait_for_loading_screen
import selenium.common.exceptions
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

execs = Value('i', 0)
customers = {}
filename = 0


def preparation():
    global customers
    driver = create_driver()
    login_panel(driver)
    for i in range(0, int(os.environ['THREADS'])):
        customers[create_customer(driver)] = create_domain(driver)
    del i
    for customer in customers.keys():
        create_subscriber(driver, customer, customers[customer])
    driver.quit()


def cleanup():
    global customers
    driver = create_driver()
    login_panel(driver)
    for customer in customers:
        delete_customer(driver, customer)
        delete_domain(driver, customers[customer])
    driver.quit()


class testrun(unittest.TestCase):

    def setUp(self):
        global execs
        global customers
        self.driver = create_driver()
        self.longMessage = True
        execs.value += 1
        key = list(customers.keys())[execs.value % int(os.environ['THREADS'])]
        self.domainname = customers[key]

    def test_login_page(self):
        global customers
        global filename
        filename = "test_login_page.png"
        driver = self.driver
        print("Try to log in with invalid credentials...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="text"]'
        ).send_keys('invalid')
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="password"]'
        ).send_keys('user')
        driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div//button').click()
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//div[contains(@class, "q-alert-container")]')) > 0,
            "Error Message was not shown")
        print("OK")
        print("Try to log in with valid credentials...", end="")
        fill_element(
            driver,
            '//*[@id="csc-login-form"]//div//input[@type="text"]',
            "testuser@" + self.domainname
        )
        fill_element(
            driver,
            '//*[@id="csc-login-form"]//div//input[@type="password"]',
            "testpasswd"
        )
        driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div//button').click()
        self.assertEqual(
            "testuser",
            driver.find_element_by_xpath('//*[@id="csc-header-toolbar"]//div//span[contains(text(), "testuser")]').text,
            "Login failed"
        )
        print("OK")
        print("Try to log out...", end="")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '//div[contains(text(), "Logout")]').click()
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        print(
            "Change login page language to all avalible languages...", end="")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        xp = '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-item q-item-division relative-position q-item-link"]'
        step(driver, xp)
        click_js(
            driver,
            '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-collapsible-sub-item relative-position"]/div[2]'
        )
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains(text(), "Authentification de l’abonné")]')) > 0,
            'Language was not changed to France')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-collapsible-sub-item relative-position"]/div[3]')
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains(text(), "Accedi come utente")]')) > 0,
            'Language was not changed to Italian')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-collapsible-sub-item relative-position"]/div[4]')
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains(text(), "Iniciar sesión de suscriptor")]')) > 0,
            'Language was not changed to Spanish')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-collapsible-sub-item relative-position"]/div[5]')
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains(text(), "Subscriber Log-in")]')) > 0,
            'Language was not changed to German')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-collapsible-sub-item relative-position"]/div[1]')
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains(text(), "Subscriber Sign In")]')) > 0,
            'Language was not changed back to English')
        print("OK")
        filename = 0

    def test_call_blocking(self):
        global customers
        global filename
        filename = "test_call_blocking.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        print("OK")
        print("Go to 'Call Blocking' page...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Blocking")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Blocking")]').click()
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Incoming")]')
        print("OK")
        print("Go to 'Incoming'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Incoming")]').click()
        step(driver, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]')
        print("OK")
        print("Enable 'All anonymous incoming calls are blocked'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]').click()
        step(driver, '//*[@id="q-app"]//div[@class="q-item-label"][contains(text(), "Only incoming calls")]')
        print("OK")
        print("Enable 'Only incoming calls from listed numbers are allowed'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"][contains(text(), "Only incoming calls")]').click()
        step(driver, '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]/span[contains(@class, "q-btn-inner")]')
        print("OK")
        print("Add a number to incoming call blocks...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]/span[contains(@class, "q-btn-inner")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@type="text"]').send_keys('12345')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-form-actions row justify-center"]/button[2]').click()
        print("OK")
        print("Check if all settings were properly changed...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]/div[contains(@class, "active")]')) > 0,
            "Option 'All anonymous incoming calls are blocked' was not "
            "enabled")
        self.assertEqual("12345", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        step(driver, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]')
        print("OK")
        print("Edit recently added number...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]/div[1]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div/input[@class="col q-input-target text-left"]', '54321')
        elem = driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//i[text()="check"]')
        driver.execute_script("arguments[0].click();", elem)
        driver.implicitly_wait(2)
        step(driver, '//*[@id="q-app"]//div[@class="csc-spinner"]/svg', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Check if number was changed properly...", end="")
        self.assertEqual("54321", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        step(driver, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]')
        print("OK")
        print("Delete number...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "csc-dialog-actions")]/button[contains(@class, "text-negative")]').click()
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-list-message"][contains(text(), "No numbers found")]')) > 0,
            "Number has not been deleted")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Outgoing")]')
        print("OK")
        print("Go to 'Outgoing'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Outgoing")]').click()
        step(driver, '//*[@id="q-app"]//div[@class="q-item-label"][contains(text(), "Only outgoing calls")]')
        print("OK")
        print(
            "Enable 'Only outgoing calls from listed numbers are allowed'...",
            end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"][contains(text(), "Only outgoing calls")]').click()
        step(driver, '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]/span[contains(@class, "q-btn-inner")]')
        print("OK")
        print("Add a number to outgoing call blocks...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]/span[contains(@class, "q-btn-inner")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@type="text"]').send_keys('12345')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-form-actions row justify-center"]/button[2]').click()
        print("OK")
        print("Check if all settings were properly changed...", end="")
        self.assertEqual("12345", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        step(driver, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]')
        print("OK")
        print("Edit recently added number...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]/div[1]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div/input[@class="col q-input-target text-left"]', '54321')
        elem = driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//i[text()="check"]')
        driver.execute_script("arguments[0].click();", elem)
        driver.implicitly_wait(2)
        step(driver, '//*[@id="q-app"]//div[@class="csc-spinner"]/svg', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Check if number was changed properly...", end="")
        self.assertEqual("54321", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        step(driver, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]')
        print("OK")
        print("Delete number...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "csc-dialog-actions")]/button[contains(@class, "text-negative")]').click()
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-list-message"][contains(text(), "No numbers found")]')) > 0,
            "Number has not been deleted")
        driver.implicitly_wait(2)
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Privacy")]/div[@class="q-inner-loading animate-fade absolute-full column flex-center"]', inv=True)
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Privacy")]/div[@class="q-inner-loading animate-fade absolute-full column flex-center"]', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Go to 'Privacy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Privacy")]').click()
        step(driver, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]')
        print("OK")
        print("Enable 'Hide number to callee'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]').click()
        step(driver, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]')
        print("OK")
        print("Check if 'Hide number to callee' was enabled...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-toggle")]//span[contains(text(), "Your number is hidden")]')) > 0,
            "Option 'hide number' was not enabled")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_call_forward_after_hours(self):
        global customers
        global filename
        filename = "test_call_forward_after_hours.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        print("OK")
        print("Go to 'Call Forward' page...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Forward")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Forward")]').click()
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "After Hours")]')
        print("OK")
        print("Go to 'After Hours'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "After Hours")]').click()
        time.sleep(1)
        step(driver, '//*[@id="q-app"]//div[@class="q-alert-actions row items-center"]/span[contains(text(), "Add After Hours")]')
        print("OK")
        print("Add After Hours time set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-alert-actions row items-center"]/span[contains(text(), "Add After Hours")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-division relative-position"]//div[@class="q-item- row no-wrap"]/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]//div[contains(@class, "q-datetime-clock-pos-8")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]/button[3]').click()
        step(driver, '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-division relative-position"]//div[@class="q-item- row no-wrap"]/div[3]')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-division relative-position"]//div[@class="q-item- row no-wrap"]/div[3]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]//div[contains(@class, "q-datetime-clock-pos-16")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]/button[3]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add number to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add number to 'When im busy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[2]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "200")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im busy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[2]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Enable 'Ring own phone'...", end="")
        step(driver, '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]/div[@tabindex="0"]/div[@class="q-option-inner relative-position"]')
        click_js(
            driver,
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]/div[@tabindex="0"]/div[@class="q-option-inner relative-position"]')
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if all values are correct...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]/div[@class="q-option-inner relative-position active"]')) > 0, "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'first ring own phone for 15 secs', "Option 'first ring ' "
            "own Phone for 15 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'then ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[1]//div[@class="dest-row"]').text, 'first ring testdestination for 200 secs', "Option "
            "'Ring testdestination for 200 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im busy' is missing")
        print("OK")
        print("Add new source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-tab column flex-center relative-position icon-and-label"]//span[contains(text(), "Add new")]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[1]//input', 'firsttestsourceset')
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[2]//input', 'firsttestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[@tabindex=0]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="q-popover animate-scale column no-wrap"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Go to new source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/span[contains(text(), "firsttestsourceset")]').click()
        print("OK")
        print("Check if source in source set is correct...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "firsttestsource")]'
            )) > 0, "Source was not found")
        print("OK")
        print("Add a new source...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/button').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="add-source-form"]//input',
            'newtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-source-form"]/button[2]'
            ).click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if second source is created properly...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'
            )) > 0, "Second Source was not found")
        print("OK")
        print("Delete second source...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]/../div[2]').click()
        step(driver, '/html/body//div[@class="modal-buttons row"]/button[2]')
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        print("OK")
        print("Check if second source was deleted...", end="")
        wait_for_loading_screen(driver)
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'),
            "Second Source was not deleted")
        print("OK")
        print(
            "Try to delete first source and check if error message appears...",
            end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "firsttestsource")]/../div[2]').click()
        self.assertTrue(len(driver.find_elements_by_xpath(
            '/html/body//div[@class="q-alert row no-wrap shadow-2 bg-negative"]')) > 0, "Error Message 'Removing the "
            "last source entry is not allowed' did not appear")
        print("OK")
        print("Add number to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if everyting was added correctly...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'first ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        print("OK")
        print("Swap entries in 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]/div[@class="q-item-side q-item-side-right q-item-section dest-btns cursor-pointer"]'
            ).click()
        driver.find_element_by_xpath(
            '/html/body/div[@class="q-popover animate-scale"]/div/div[1]'
            ).click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if entries got swapped...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'first ring Voicebox', "Options did not get swapped"
            )
        print("OK")
        print("Delete second source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/div/button[@align="right"]').click()
        step(driver, '/html/body//div[@class="modal-buttons row"]/button[2]')
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Check if second source set was deleted...", end="")
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div/span[contains(text(), "firsttestsourceset")]'),
            "Second Source Set was not deleted")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_call_forward_always(self):
        global customers
        global filename
        filename = "test_call_forward_always.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        print("OK")
        print("Go to 'Call Forward' page...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Forward")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Forward")]').click()
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Always")]')
        print("OK")
        print("Go to 'Always'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Always")]').click()
        driver.implicitly_wait(2)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Add number to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add number to 'When im busy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[2]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "200")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im busy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[2]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Enable 'Ring own phone'...", end="")
        step(driver, '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]/div[@tabindex="0"]/div[@class="q-option-inner relative-position"]')
        click_js(
            driver,
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]/div[@tabindex="0"]/div[@class="q-option-inner relative-position"]')
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if all values are correct...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]/div[@class="q-option-inner relative-position active"]')) > 0, "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'first ring own phone for 15 secs', "Option 'first ring ' "
            "own Phone for 15 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'then ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[1]//div[@class="dest-row"]').text, 'first ring testdestination for 200 secs', "Option "
            "'Ring testdestination for 200 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im busy' is missing")
        print("OK")
        print("Add new source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-tab column flex-center relative-position icon-and-label"]//span[contains(text(), "Add new")]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[1]//input', 'secondtestsourceset')
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[2]//input', 'secondtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[@tabindex=0]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="q-popover animate-scale column no-wrap"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Go to new source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/span[contains(text(), "secondtestsourceset")]').click()
        print("OK")
        print("Check if source in source set is correct...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "secondtestsource")]'
            )) > 0, "Source was not found")
        print("OK")
        print("Add a new source...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/button').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="add-source-form"]//input',
            'newtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-source-form"]/button[2]'
            ).click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if second source is created properly...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'
            )) > 0, "Second Source was not found")
        print("OK")
        print("Delete second source...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]/../div[2]').click()
        step(driver, '/html/body//div[@class="modal-buttons row"]/button[2]')
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        print("OK")
        print("Check if second source was deleted...", end="")
        wait_for_loading_screen(driver)
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'),
            "Second Source was not deleted")
        print("OK")
        print(
            "Try to delete first source and check if error message appears...",
            end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "secondtestsource")]/../div[2]').click()
        self.assertTrue(len(driver.find_elements_by_xpath(
            '/html/body//div[@class="q-alert row no-wrap shadow-2 bg-negative"]')) > 0, "Error Message 'Removing the "
            "last source entry is not allowed' did not appear")
        print("OK")
        print("Add number to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if everyting was added correctly...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'first ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        print("OK")
        print("Swap entries in 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]/div[@class="q-item-side q-item-side-right q-item-section dest-btns cursor-pointer"]'
            ).click()
        driver.find_element_by_xpath(
            '/html/body/div[@class="q-popover animate-scale"]/div/div[1]'
            ).click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if entries got swapped...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'first ring Voicebox', "Options did not get swapped"
            )
        print("OK")
        print("Delete second source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/div/button[@align="right"]').click()
        step(driver, '/html/body//div[@class="modal-buttons row"]/button[2]')
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Check if second source set was deleted...", end="")
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div/span[contains(text(), "secondtestsourceset")]'),
            "Second Source Set was not deleted")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_call_forward_company_hours(self):
        global customers
        global filename
        filename = "test_call_forward_company_hours.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        print("OK")
        print("Go to 'Call Forward' page...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Forward")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Call Forward")]').click()
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Company Hours")]')
        print("OK")
        print("Go to 'Company Hours'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Company Hours")]').click()
        time.sleep(1)
        step(driver, '//*[@id="q-app"]//div[@class="q-alert-actions row items-center"]/span[contains(text(), "Add Company Hours")]')
        print("OK")
        print("Add Company Hours time set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-alert-actions row items-center"]/span[contains(text(), "Add Company Hours")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-division relative-position"]//div[@class="q-item- row no-wrap"]/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]//div[contains(@class, "q-datetime-clock-pos-8")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]/button[3]').click()
        step(driver, '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-division relative-position"]//div[@class="q-item- row no-wrap"]/div[3]')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-division relative-position"]//div[@class="q-item- row no-wrap"]/div[3]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]//div[contains(@class, "q-datetime-clock-pos-16")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]/button[3]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add number to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add number to 'When im busy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[2]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "200")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im busy'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[2]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Enable 'Ring own phone'...", end="")
        step(driver, '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]/div[@tabindex="0"]/div[@class="q-option-inner relative-position"]')
        click_js(
            driver,
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]/div[@tabindex="0"]/div[@class="q-option-inner relative-position"]')
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if all values are correct...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]/div[@class="q-option-inner relative-position active"]')) > 0, "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'first ring own phone for 15 secs', "Option 'first ring ' "
            "own Phone for 15 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'then ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[1]//div[@class="dest-row"]').text, 'first ring testdestination for 200 secs', "Option "
            "'Ring testdestination for 200 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im busy' is missing")
        print("OK")
        print("Add new source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-tab column flex-center relative-position icon-and-label"]//span[contains(text(), "Add new")]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[1]//input', 'thirdtestsourceset')
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[2]//input', 'thirdtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div[@tabindex=0]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="q-popover animate-scale column no-wrap"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Go to new source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/span[contains(text(), "thirdtestsourceset")]').click()
        print("OK")
        print("Check if source in source set is correct...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "thirdtestsource")]'
            )) > 0, "Source was not found")
        print("OK")
        print("Add a new source...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/button').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[@class="add-source-form"]//input',
            'newtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-source-form"]/button[2]'
            ).click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if second source is created properly...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'
            )) > 0, "Second Source was not found")
        print("OK")
        print("Delete second source...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]/../div[2]').click()
        step(driver, '/html/body//div[@class="modal-buttons row"]/button[2]')
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        print("OK")
        print("Check if second source was deleted...", end="")
        wait_for_loading_screen(driver)
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'),
            "Second Source was not deleted")
        print("OK")
        print(
            "Try to delete first source and check if error message appears...",
            end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "thirdtestsource")]/../div[2]').click()
        self.assertTrue(len(driver.find_elements_by_xpath(
            '/html/body//div[@class="q-alert row no-wrap shadow-2 bg-negative"]')) > 0, "Error Message 'Removing the "
            "last source entry is not allowed' did not appear")
        print("OK")
        print("Add number to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/../input').send_keys('testdestination')
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]/div/button[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Add voicemail to 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-card"]/div[1]/div[@class="add-destination-form"]/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]/div/div[2]').click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if everyting was added correctly...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'first ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        print("OK")
        print("Swap entries in 'When im online'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]/div[@class="q-item-side q-item-side-right q-item-section dest-btns cursor-pointer"]'
            ).click()
        driver.find_element_by_xpath(
            '/html/body/div[@class="q-popover animate-scale"]/div/div[1]'
            ).click()
        wait_for_loading_screen(driver)
        print("OK")
        print("Check if entries got swapped...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-row"]').text, 'first ring Voicebox', "Options did not get swapped"
            )
        print("OK")
        print("Delete second source set...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/div/button[@align="right"]').click()
        step(driver, '/html/body//div[@class="modal-buttons row"]/button[2]')
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Check if second source set was deleted...", end="")
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div/span[contains(text(), "thirdtestsourceset")]'),
            "Second Source Set was not deleted")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_conference_conversations(self):
        global customers
        global filename
        filename = "test_conference_conversations.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        print("OK")
        print("Check out 'Join Conference' screen...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Join conference")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Join conference")]').click()
#        --------Disabled. Active RTC:Engine required for these tests--------
#        driver.find_element_by_xpath(
#            '//*[@id="csc-conf-link-input"]/div/input').send_keys(
#                "testconference")
#        driver.find_element_by_xpath(
#            '//*[@id="csc-conf-link-input"]/div/button[contains'
#            '(@class, "text-primary")]').click()
#        self.assertEqual(driver.current_url, driver.find_element_by_xpath(
#            '//div/input[@readonly="readonly"]').get_attribute('value'),
#            "Sharing URL is not correct")
#        driver.find_element_by_xpath('/html/body').send_keys(Keys.ESCAPE)
#        WebDriverWait(driver, 10).until(EC.presence_of_element_located((
#            By.XPATH, '/html/body/div[@class="modal fullscreen row minimized'
#            ' flex-center"][@style="display: none;"]')))
        driver.find_element_by_xpath(
            '//*[@id="csc-conf-header"]/div/button').click()
        print("OK")
        print("Go to 'Conversations' page...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Conversations")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Conversations")]').click()
        print("OK")
        print("Check if all sections are empty...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-center csc-conversation-list-message"]').text, 'No Calls, Voicemails or Faxes found', "Section 'All' is not empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller row no-wrap"]//span[contains(text(), "Calls")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-center csc-conversation-list-message"]').text, 'No Calls found',
            "Section 'Calls' is notempty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller row no-wrap"]//span[contains(text(), "Faxes")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-center csc-conversation-list-message"]').text, 'No Faxes found',
            "Section 'Faxes' is not empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller row no-wrap"]//span[contains(text(), "Voicemails")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-center csc-conversation-list-message"]').text, 'No Voicemails found', "Section 'Voicemails' is not empty")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_reminder(self):
        global customers
        global filename
        filename = "test_reminder.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        print("OK")
        print("Go to 'Reminder' page...", end="")
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Reminder")]')
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Reminder")]').click()
        step(driver, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]//span[contains(text(), "Reminder")]')
        print("OK")
        print("Enable reminders...", end="")
        time.sleep(1)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle")]//span[contains(text(), "Reminder")]').click()
        step(driver, '//*[@id="q-app"]//div[contains(@class, "q-input-target justify-start")]')
        time.sleep(1)
        print("OK")
        print("Set time for reminder...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-input-target justify-start")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]//div[contains(@class, "q-datetime-clock-pos-13")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]//div[contains(@class, "q-datetime-clock-pos-7")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]/button[2]').click()
        step(driver, '//*[@id="q-app"]//div[@tabindex="0"]/span[@class="q-option-label"][contains(text(), "Always")]')
        time.sleep(1)
        print("OK")
        print("Set reminder to 'Always'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]//span[contains(text(), "Always")]').click()
        print("OK")
        print("Check if reminder settings were applied correctly...", end="")
        self.assertEqual('Reminder is enabled', driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]//span[contains(text(), "Reminder")]').text,
            "Reminder is not enabled")
        self.assertEqual('13:35', driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-input-target justify-start")]').text,
            "Time is not correct")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]/div[contains(@class, "active")]/../span[contains(text(), "Always")]')) > 0,
            "Option 'Always' was not selected")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_settings(self):
        global customers
        global filename
        filename = "test_settings.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Reminder")]')
        print("OK")
        print("Change home page language to all avalible languages...", end="")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        xp = '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-item q-item-division relative-position q-item-link"]'
        click_div = '/html/body/div[@class="q-popover animate-scale"]//div[@class="q-collapsible-sub-item relative-position"]/div[{}]'
        step(driver, xp)
        click_js(driver, click_div.format(2))
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Rappel")]')) > 0,
            'Language was not changed to France')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(driver, click_div.format(3))
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Promemoria")]')) > 0,
            'Language was not changed to Italian')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(driver, click_div.format(4))
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Recordatorio")]')) > 0,
            'Language was not changed to Spanish')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(driver, click_div.format(5))
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Erinnerung")]')) > 0,
            'Language was not changed to German')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        step(driver, xp)
        click_js(driver, click_div.format(1))
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Reminder")]')) > 0,
            'Language was not changed back to English')
        print("OK")
        print("Change user password...", end="")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '/html/body//div[contains(text(), "Settings")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password"]/../input').send_keys('pass1234')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password retyped"]/../input').send_keys('pass1234')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center"]/button[2]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="csc-dialog-actions row justify-end no-wrap"]/button[2]').click()
        step(driver, '//*[@id="csc-login-form"]//div//input[@type="text"]')
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        print("Try to log in with new password...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'pass1234')
        self.assertEqual("testuser", driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]//div//span[contains(text(), "testuser")]').text, "Login failed")
        print("OK")
        print("Change password back to old password...", end="")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '/html/body//div[contains(text(), "Settings")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password"]/../input').send_keys('testpasswd')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password retyped"]/../input').send_keys('testpasswd')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center"]/button[2]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="csc-dialog-actions row justify-end no-wrap"]/button[2]').click()
        step(driver, '//*[@id="csc-login-form"]//div//input[@type="text"]')
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_speed_dial(self):
        global customers
        global filename
        filename = "test_speed_dial.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Speed Dial")]')
        print("OK")
        print("Go to 'Speed Dial'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Speed Dial")]').click()
        driver.implicitly_wait(2)
        step(driver, '//div[@class="q-loading animate-fade fullscreen column flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat text-white"]', inv=True)
        driver.implicitly_wait(10)
        print("OK")
        print("Add a speed dial...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//button[contains(@class, "q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]').click()
        driver.find_element_by_xpath(
            '//*[@class="no-border scroll q-list q-list-link"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@class="col q-input-target text-left"]').send_keys("testtext")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center form-actions"]/button[contains(@class, "text-primary")]').click()
        print("OK")
        print("Check if speed dial details are correct...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]/span[contains(text(), "When")]')
            .text, "When I dial *1 ...", "Speed dial has not been created")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-sublabel"][contains(text(), "ring")]')
            .text, "ring testtext", "Speed dial is not correct")
        print("OK")
        print("Add a second speed dial...", end="")
        step(driver, '//*[@id="q-app"]//div//button[contains(@class, "q-btn-rectangle")]')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//button[contains(@class, "q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]').click()
        driver.find_element_by_xpath(
            '//*[@class="no-border scroll q-list q-list-link"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@class="col q-input-target text-left"]').send_keys("asdf")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center form-actions"]/button[contains(@class, "text-primary")]').click()
        print("OK")
        print("Check if second speed dial details are correct...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]/span[contains(text(), "*2")]')
            .text, "When I dial *2 ...", "Speed dial has not been created")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-sublabel"][contains(text(), "asdf")]')
            .text, "ring asdf", "Speed dial is not correct")
        print("OK")
        print("Delete all speed dials...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[@slot="right"]').click()
        driver.find_element_by_xpath(
            '//div[@class="modal-buttons row"]//button[contains(@class, "text-negative")]').click()
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((
            By.XPATH, '//div[@class="q-toast-container active"]//div[contains(text(), "Unassigned slot *1")]')))
        step(driver, '//*[@id="q-app"]//div/button[@slot="right"]')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[@slot="right"]').click()
        driver.find_element_by_xpath(
            '//div[@class="modal-buttons row"]//button[contains(@class, "text-negative")]').click()
        print("OK")
        print("Check if speed dials were deleted...", end="")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "No speed dials found")]')
            ) > 0, "Speed dials was not deleted")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def test_voicebox(self):
        global customers
        global filename
        filename = "test_voicebox.png"
        driver = self.driver
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        step(driver, '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Voicebox")]')
        print("OK")
        print("Go to 'Voicebox'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"][contains(text(), "Voicebox")]').click()
        print("OK")
        print("Try to enter an invalid voicebox pin...", end="")
        step(driver, '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../input')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../input').send_keys("invalid")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[@class="q-field-error col"]')) > 0, "Invalid PIN was not detected")
        print("OK")
        print("Enter valid voicebox pin...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../../i[1]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../input', "12345")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../../i[1]').click()
        print("OK")
        print("Try to enter an invalid voicebox email...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../input').send_keys("invalid")
        self.assertTrue(len(driver.find_elements_by_xpath(
                '//*[@id="q-app"]//div[@class="q-field-error col"]')) > 0, "Invalid Email was not detected")
        print("OK")
        print("Enter valid voicebox email...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../../i[1]').click()
        fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../input', "test@email.com")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../../i[1]').click()
        print("OK")
        print("Enable 'Delete voicemail after notification'...", end="")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-toggle")]/span[contains(text(), "Delete voicemail")]').click()
        print("OK")
        print("Check if voicebox settings are correct...", end="")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../input')
            .get_attribute('value'), "12345", "PIN is not correct")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../input')
            .get_attribute('value'), "test@email.com", "Email is not correct")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-toggle-enabled")]/span[contains(text(), "Attach voicemail")]')) > 0,
            "Option 'Attach voicemail to email notification' was not enabled")
        self.assertTrue(len(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-toggle-enabled")]/span[contains(text(), "Delete voicemail")]')) > 0,
            "Option 'Delete voicemail after email notification is delivered' "
            "was not enabled")
        print("OK")
        print("Logout...", end="")
        logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        print("OK")
        filename = 0

    def tearDown(self):
        global customers
        global filename
        driver = self.driver
        if filename:
            print("FAIL")
            driver.save_screenshot('/results/' + filename)
            filename = 0
        driver.quit()


if __name__ == '__main__':
    print('Preparing Domain, Customer and Subscriber for NGCP CSC tests ...')
    try:
        preparation()
    except Exception as e:
        print('Preperation failed! See logs below for more details')
        print('--------------------------------------------------------------')
        traceback.print_exc()
        print('--------------------------------------------------------------')
        quit(1)
    print('Preperation successful, running tests now ...')
    nose2.main(exit=False)
    try:
        cleanup()
    except Exception as e:
        traceback.print_exc()
        quit(1)
