import unittest
import os
import traceback
from multiprocessing import Value
import nose2
import time

from functions.Collections import create_customer
from functions.Collections import create_subscriber
from functions.Collections import create_domain
from functions.Collections import delete_customer
from functions.Collections import delete_subscriber
from functions.Collections import delete_domain
from functions.Collections import login_csc
from functions.Collections import login_panel
from functions.Collections import logout_csc
from functions.Functions import click_js
from functions.Functions import create_driver
from functions.Functions import fill_element
from functions.Functions import scroll_to_element
from functions.Functions import wait_for_loading_screen
from functions.Functions import wait_for_invisibility
import selenium.common.exceptions
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from datetime import datetime

execs = Value('i', 0)
customers = {}
filename = 0


def preparation():
    global customers
    driver = create_driver()
    try:
        login_panel(driver)
        for i in range(0, int(os.environ['THREADS'])):
            customers[create_customer(driver)] = create_domain(driver)
        del i
        for customer in customers.keys():
            create_subscriber(driver, customer, customers[customer])
        driver.quit()
    except Exception:
        driver.save_screenshot('/results/preperation.png')
        driver.quit()
        raise Exception


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

    def test_call_blocking(self):
        global customers
        global filename
        filename = "test_call_blocking.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Block Incoming' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Block incoming")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-incoming"]')) > 0, "'Block Incoming' page wasnt opened")
        print("OK")
        print("Try to block all incoming anonymous Calls...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div[@tabindex="0"]/div[1]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-incoming"]/div[1]/div/div[@aria-checked="true"]')) > 0,
            "Incoming Anonymous Calls were not disabled")
        print("OK")
        print("Try to enable option 'Only allow incoming calls from listed numbers'...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div[contains(., "Only incoming calls")]/../div[1]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div[contains(@class, "q-radio__inner--truthy")]')) > 0,
            "Option 'Only incoming calls from listed numbers are allowed' was not enabled")
        print("OK")
        """
        print("Trying to add a number to the incoming calls list...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div/button[contains(., "Add number")]').click()
        click_js(driver, '//*[@id="csc-page-call-blocking-incoming"]//div/input')
        fill_element(driver, '//*[@id="csc-page-call-blocking-incoming"]//div/input', "Testnumber")
        driver.find_element_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div/button[2]')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div[@data-cy="csc-blocked-number"]/div[contains(., "Testnumber")]')) > 0,
            "Number was not added")
        print("OK")
        print("Trying to delete a number to the incoming calls list...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-call-blocking-incoming"]//div/button[@data-cy="csc-more-menu"]').click()
        driver.find_element_by_xpath('/html/body//div[contains(., "Remove")]').click()
        driver.find_element_by_xpath('/html/body//div/button[contains(., "OK")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-incoming"]/div[contains(., "No numbers found")]')) > 0,
            "Number was not deleted")
        """
        print("Go to 'Block Outgoing' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Block outgoing")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-outgoing"]')) > 0, "'Block Outgoing' page wasnt opened")
        print("OK")
        print("Try to enable option 'Only allow incoming calls from listed numbers'...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-call-blocking-outgoing"]/div[1]/div/div[2]/div[1]/div/div[1]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-outgoing"]/div[1]/div/div[2]/div[1]/div[@aria-checked="true"]')) > 0,
            "Option 'Only outgoing calls from listed numbers are allowed' was not enabled")
        filename = 0

    def test_call_forwarding(self):
        global customers
        global filename
        filename = "test_call_forwarding.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Forwarding")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-forwarding"]')) > 0, "Conference page wasnt opened")
        print("OK")
        print("Create a call forwarding 'if available'...", end="")
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')))
        time.sleep(1)
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]/div[1]/button/span[3]/svg[@class="q-spinner text-primary]"')
        time.sleep(1)
        click_js(driver, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')
        click_js(driver, '/html/body/div[3]/div/div[3]')
        print("OK")
        print("Try to add a condition 'call from...' to the call forwarding...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]').click()
        driver.find_element_by_xpath('/html/body/div[3]/div/div[2]/div/div[1]').click()
        fill_element(driver, '/html/body//div[1]/div/label//div//input', 'TestUser')
        fill_element(driver, '/html/body//div[2]/div/label//div//input', '1234')
        driver.find_element_by_xpath('/html/body//button[contains(., "Add number")]').click()
        fill_element(driver, '/html/body/div[3]//div[3]//label//div//input', '5678')
        driver.find_element_by_xpath('/html/body//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '/html/body/div[3]')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "TestUser")]')) > 0,
            "Condition 'call from...' was not added")
        print("OK")
        print("Try to edit 'forwared to...' number...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "Number")]').click()
        fill_element(driver, "/html/body//label//div//input", 'TestNumber')
        driver.find_element_by_xpath('/html/body//div/button[contains(., "Set")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div[contains(., "TestNumber")]')) > 0,
            "'forward to...' number was not changed")
        print("OK")
        print("Try to add a second condition 'office hours are...'...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]').click()
        driver.find_element_by_xpath('/html/body/div[3]/div/div[2]/div/div[6]').click()
        fill_element(driver, '/html/body//div[1]/label//div//input[@aria-label="Start time"]', '1200')
        fill_element(driver, '/html/body//div[2]/label//div//input[@aria-label="End time"]', '1800')
        driver.find_element_by_xpath('/html/body//div//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "Monday, Tuesday, Wednesday, Thursday, Friday")]')) > 0,
            "'Office hours are...' condition is not correct")
        print("OK")
        print("Try to delete second condition...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "Monday")]').click()
        driver.find_element_by_xpath('/html/body//div//button[contains(., "Delete")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]')) > 0,
            "Second condition was not deleted")
        print("OK")
        print("Try to add second condition 'date is...'...", end="")
        day = datetime.today().day
        if day >= 28:
            day -= 1
        elif day < 28:
            day += 1
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]').click()
        driver.find_element_by_xpath('/html/body/div[3]/div/div[2]/div/div[3]/div[3]').click()
        driver.find_element_by_xpath('/html/body//div[@class="q-date__calendar-days fit"]//div//button//span[normalize-space()="' + str(day) + '"]').click()
        driver.find_element_by_xpath('/html/body//div//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        if day < 10:
            day = "0" + str(day)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[2][contains(., "' + datetime.today().strftime('%Y/%m/') + day + '")]')) > 0,
            "'Office hours are...' condition is not correct")
        print("OK")
        print("Try to delete second condition...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "' + datetime.today().strftime('%Y/%m/') + day + '")]').click()
        driver.find_element_by_xpath('/html/body//div//button[contains(., "Delete")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]')) > 0,
            "Second condition was not deleted")
        print("OK")
        print("Try to delete first condition...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "TestUser")]').click()
        driver.find_element_by_xpath('/html/body/div[3]/div/div[3]/button[1]').click()
        wait_for_invisibility(driver, '/html/body/div[3]/div/div[4]/svg')
        print("OK")
        print("Try to add another foward...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[1]/div[2]/button').click()
        driver.find_element_by_xpath('/html/body/div[3]/div/div[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[3]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]//div[contains(., "Voicebox")]')) > 0, "Voicebox forwarding was not added")
        print("OK")
        print("Try to change the amount of time before it switches to the next forward...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[3]/div[2]/div/span[contains(., "seconds")]').click()
        fill_element(driver, '/html/body/div[3]/label/div/div/div[2]/input', "30")
        driver.find_element_by_xpath('/html/body/div[3]/div/button[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[3]/div[2]/div/span[contains(., "30")]')) > 0,
            "Voicebox forwarding time was not changed")
        print("OK")
        print("Try to disable a call forward...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[1]/div[2]/button').click()
        driver.find_element_by_xpath('/html/body/div[3]/div//div[contains(., "Disable")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[contains(@class, "disabled")]')) > 0,
            "Call forward was not disabled")
        print("OK")
        print("Try to enable a call forward...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[1]/div[2]/button').click()
        driver.find_element_by_xpath('/html/body/div[3]/div//div[contains(., "Enable")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[4]/svg')
        print("OK")
        print("Try to delete call forwarding...", end="")
        driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[1]/div[2]/button').click()
        driver.find_element_by_xpath('/html/body/div[3]/div//div[contains(., "Remove")]').click()
        driver.find_element_by_xpath('/html/body/div[3]/div[2]/div/div[3]/button[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            driver.find_element_by_xpath('//*[@id="csc-wrapper-call-forwarding"]/div/div[1]/div/div').text == "Always", "Call forward was not deleted")
        filename = 0

    def test_login_page(self):
        global customers
        global filename
        filename = "test_login_page.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with no credentials...", end="")
        driver.find_element_by_xpath('//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with invalid credentials...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "invaliduser")
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "invalidpass")
        driver.find_element_by_xpath('//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with invalid password...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "invalidpass")
        driver.find_element_by_xpath('//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with empty password...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        driver.find_element_by_xpath('//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with valid credentials...", end="")
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "testpasswd")
        driver.find_element_by_xpath('//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Try to log out...", end="")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-main"]/button[contains(., "testuser")]').click()
        driver.find_element_by_xpath('/html/body/div[3]/div/div').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-login"]')) > 0,
            "Logout wasnt successful")
        print("OK")
        print("Trying to change to every available language...", end="")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div[3]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-login-card"]/div[contains(., "Subscriber-Anmeldung")]')) > 0,
            "Language wasnt changed to German")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div[4]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-login-card"]/div[contains(., "Iniciar sesión de suscriptor")]')) > 0,
            "Language wasnt changed to Spanish")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div[5]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-login-card"]/div[contains(., "Authentification de l’abonné")]')) > 0,
            "Language wasnt changed to French")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div[6]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-login-card"]/div[contains(., "Accedi come utente")]')) > 0,
            "Language wasnt changed to Italian")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div[7]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-login-card"]/div[contains(., "Регистрация подписчика")]')) > 0,
            "Language wasnt changed to Russian")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div[2]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-login-card"]/div[contains(., "Subscriber Sign In")]')) > 0,
            "Language wasnt changed to English")
        print("OK")
        filename = 0

    def test_other(self):
        global customers
        global filename
        filename = "test_other.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "testpasswd")
        driver.find_element_by_xpath('//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Join Conference' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]/a[contains(., "Join conference")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-conference"]')) > 0, "Conference page wasnt opened")
        driver.find_element_by_xpath('//*[@id="csc-header-toolbar-conference"]/button').click()
        print("OK")
        print("Go to 'Conversations' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]/a[contains(., "Conversations")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-conversations"]')) > 0, "Conversations page wasnt opened")
        print("OK")
        print("Trying to go through every subpage...", end="")
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-conversations"]//div[contains(., "No Calls, Voicemails or Faxes found")]')) > 0,
            "Sub page 'All' wasnt opened")
        driver.find_element_by_xpath('//*[@id="csc-page-conversations"]//div[@role="tablist"]/div/div[2]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-conversations"]//div[contains(., "No Calls found")]')) > 0,
            "Sub page 'Calls' wasnt opened")
        driver.find_element_by_xpath('//*[@id="csc-page-conversations"]//div[@role="tablist"]/div/div[3]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-conversations"]//div[contains(., "No Voicemails found")]')) > 0,
            "Sub page 'Voicemails' wasnt opened")
        driver.find_element_by_xpath('//*[@id="csc-page-conversations"]//div[@role="tablist"]/div/div[4]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-conversations"]//div[contains(., "No Faxes found")]')) > 0,
            "Sub page 'Faxes' wasnt opened")
        print("OK")
        print("Go to 'General'...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "General")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]//div[contains(., "Music on Hold")]')) > 0,
            "General page wasnt opened")
        print("OK")
        print("Try to enable 'Music on Hold'...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-voicebox"]/div/div[1]/div[2]/svg')
        click_js(driver, '//*[@id="csc-page-voicebox"]//div[@aria-label="Music on Hold"]/div[1]')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]//div[@aria-checked="true"]')) > 0,
            "Music on Hold was not enabled")
        print("OK")
        print("Go to 'Privacy' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Privacy")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-privacy"]')) > 0, "Privacy page wasnt opened")
        print("OK")
        print("Try to enable privacy setting...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-call-blocking-privacy"]/div/div/div[2]/svg')
        click_js(driver, '//*[@id="csc-page-call-blocking-privacy"]//div[@role="checkbox"]/div[1]')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-call-blocking-privacy"]//div[contains(., "Your number is hidden to the callee")]')) > 0,
            "Privacy setting wasnt enabled")
        filename = 0

    def test_reminder(self):
        global customers
        global filename
        filename = "test_reminder.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Reminder' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Reminder")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-reminder"]')) > 0, "Reminder page wasnt opened")
        print("OK")
        print("Try to enable reminders...", end="")
        click_js(driver, '//*[@id="csc-page-reminder"]//div[@aria-label="Reminder is disabled"]//input')
        wait_for_invisibility(driver, '//*[@id="csc-page-reminder"]//div[@aria-label="Reminder is disabled"]')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-reminder"]//div[@aria-label="Reminder is enabled"]')) > 0,
            "Reminder has not been enabled")
        print("OK")
        print("Try to change reminder recurrance to 'Always'...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-reminder"]//div[@aria-label="Always"]').click()
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '/html/body//div[@role="alert"]')))
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-reminder"]//div[@aria-label="Always"][@aria-checked="true"]')) > 0,
            "Reminder has not been enabled")
        print("OK")
        print("Try to change time to 12:00...")
        driver.find_element_by_xpath('//*[@id="csc-page-reminder"]/div/div[3]/div/label/div/div/div[2]/input').click()
        driver.find_element_by_xpath('//*[@id="csc-page-reminder"]/div/div[3]/div/label/div/div/div[2]/input').click()
        fill_element(driver, '//*[@id="csc-page-reminder"]/div/div[3]/div/label/div/div/div[2]/input', '1200')
        print(driver.find_element_by_xpath('//*[@id="csc-page-reminder"]//div[@aria-label="Always"][@aria-checked="true"]').get_attribute("value"))
        self.assertTrue(
            driver.find_element_by_xpath('//*[@id="csc-page-reminder"]/div//label//div//input').get_attribute("value") == '12:00',
            "Time has not been changed")
        filename = 0

    def test_speed_dial(self):
        global customers
        global filename
        filename = "test_speeddial.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Speed Dial")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-speed-dial"]')) > 0, "Speed dial page wasnt opened")
        print("OK")
        print("Try to create a new Speed Dial...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-speed-dial"]//div/button').click()
        driver.find_element_by_xpath('//*[@id="csc-page-speed-dial"]//div/label').click()
        driver.find_element_by_xpath('/html/body//*[contains(., "*5")]').click()
        fill_element(driver, '//*[@id="csc-page-speed-dial"]//div/label[2]//div/input[@aria-label="Destination"]', "testination")
        click_js(driver, '//*[@id="csc-page-speed-dial"]//button[contains(., "Save")]')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-speed-dial"]//div[contains(., "When I dial *5")]')) > 0,
            "Speed dial button is not correct")
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-speed-dial"]//div[contains(., "testination")]')) > 0,
            "Speed dial destination is not correct")
        print("OK")
        print("Try to delete the speed dial...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-speed-dial"]/div[2]/div/div/div[3]/button').click()
        driver.find_element_by_xpath('/html/body/div[contains(., "Remove")]').click()
        driver.find_element_by_xpath('/html/body//div//button[contains(., "OK")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-speed-dial"]/div[2]/div[contains(., "No speed dials found")]')) > 0,
            "Speed dial was not deleted")
        filename = 0

    def test_voicebox(self):
        global customers
        global filename
        filename = "test_voicebox.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element_by_xpath('//*[@id="csc-main-menu-top"]//div/a[contains(., "Voicebox")]').click()
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]')) > 0, "Conference page wasnt opened")
        print("OK")
        print("Try to enter invalid PIN...", end="")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]')))
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]', "asdf")
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]//div/i[contains(., "error")]')) > 0,
            "Wrong PIN has not been detected")
        print("OK")
        print("Try to enter valid PIN...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div/button[contains(., "Undo")]').click()
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]', "12345")
        driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div//button[contains(., "Save")]').click()
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div[5]/div')))
        self.assertTrue(
            driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]').get_attribute("value") == "12345",
            "Changed PIN is not correct")
        print("OK")
        print("Try to enter an invalid Email...", end="")
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]', "test")
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]//div/i[contains(., "error")]')) > 0,
            "Wrong Email has not been detected")
        driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div/button[contains(., "Undo")]').click()
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]', "test@test")
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]//div/i[contains(., "error")]')) > 0,
            "Wrong Email has not been detected")
        print("OK")
        print("Try to enter a valid Email...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div/button[contains(., "Undo")]').click()
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]', "test@test.com")
        driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div//button[contains(., "Save")]').click()
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div[5]/div')))
        self.assertTrue(
            driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]').get_attribute("value") == "test@test.com",
            "Changed Email is not correct")
        print("OK")
        print("Try to disable 'Attach voicemail to email' setting...", end="")
        driver.find_element_by_xpath('//*[@id="csc-page-voicebox"]/div/div[3]/div[1]/div/div[1]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-voicebox"]/div/div[3]/div[2]/svg')
        self.assertTrue(
            len(driver.find_elements_by_xpath('//*[@id="csc-page-voicebox"]/div/div[4]/div[1]/div[@aria-disabled="true"]')) > 0,
            "Setting was not disabled")
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
    print('----------------------------------------------------------------------')
    print('Preparing Domain, Customer and Subscriber for NGCP CSC tests ...')
    try:
        preparation()
    except Exception as e:
        print('Preperation failed! See log below for more details')
        print('----------------------------------------------------------------------')
        traceback.print_exc()
        print('----------------------------------------------------------------------')
        quit(1)
    print('Preperation successful, running tests now ...')
    print('----------------------------------------------------------------------')

    nose2.main(exit=False)
    try:
        cleanup()
    except Exception as e:
        traceback.print_exc()
        quit(1)
