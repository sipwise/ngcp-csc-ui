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
from functions.Collections import logout_panel
from functions.Collections import logout_csc
from functions.Functions import click_js
from functions.Functions import create_driver
from functions.Functions import fill_element
from functions.Functions import scroll_to_element
from functions.Functions import wait_for_loading_screen
from functions.Functions import wait_for_invisibility
import selenium.common.exceptions
from selenium import webdriver
from selenium.webdriver.common.alert import Alert
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
        if os.environ.get('vmtype') == None:
            os.environ['vmtype'] = "CE"
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
        self.key = list(customers.keys())[execs.value % int(os.environ['THREADS'])]
        self.domainname = customers[self.key]

    def test_call_blocking(self):
        global customers
        global filename
        filename = "test_call_blocking.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Block Incoming' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Block Incoming")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]')) > 0, "'Block Incoming' page wasnt opened")
        print("OK")
        print("Try to block all incoming anonymous Calls...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div[@tabindex="0"]/div[1]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]/div[1]/div/div[@aria-checked="true"]')) > 0,
            "Incoming Anonymous Calls were not disabled")
        print("OK")
        print("Try to enable option 'Only allow incoming calls from listed numbers'...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div[contains(., "Only incoming calls")]/../div[1]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div[contains(@class, "q-radio__inner--truthy")]')) > 0,
            "Option 'Only incoming calls from listed numbers are allowed' was not enabled")
        print("OK")
        """
        print("Trying to add a number to the incoming calls list...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div/button[contains(., "Add number")]').click()
        click_js(driver, '//*[@id="csc-page-call-blocking-incoming"]//div/input')
        fill_element(driver, '//*[@id="csc-page-call-blocking-incoming"]//div/input', "Testnumber")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div/button[2]')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div[@data-cy="csc-blocked-number"]/div[contains(., "Testnumber")]')) > 0,
            "Number was not added")
        print("OK")
        print("Trying to delete a number to the incoming calls list...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]//div/button[@data-cy="csc-more-menu"]').click()
        driver.find_element(By.XPATH, '/html/body//div[contains(., "Remove")]').click()
        driver.find_element(By.XPATH, '/html/body//div/button[contains(., "OK")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-incoming"]/div[contains(., "No numbers found")]')) > 0,
            "Number was not deleted")
        """
        print("Go to 'Block Outgoing' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Block outgoing")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-outgoing"]')) > 0, "'Block Outgoing' page wasnt opened")
        print("OK")
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
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Forwarding")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-forwarding"]')) > 0, "Conference page wasnt opened")
        print("OK")
        print("Create a call forwarding 'if available'...", end="")
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')))
        time.sleep(1)
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]/div[1]/button/span[3]/svg[@class="q-spinner text-primary"]')
        time.sleep(1)
        click_js(driver, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')
        click_js(driver, '//div[@data-cy="csc-add-forwarding-available"]')
        print("OK")
        print("Try to add a condition 'call from...' to the call forwarding...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]').click()
        driver.find_element(By.XPATH, '//div[@data-cy="csc-condtion-call-from"]').click()
        fill_element(driver, '/html/body//div[1]/div/label//div//input', 'TestUser')
        fill_element(driver, '/html/body//div[2]/div/label//div//input', '1234')
        driver.find_element(By.XPATH, '/html/body//button[contains(., "Add number")]').click()
        fill_element(driver, '/html/body/div[3]//div[3]//label//div//input', '5678')
        driver.find_element(By.XPATH, '/html/body//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '/html/body/div[3]')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "TestUser")]')) > 0,
            "Condition 'call from...' was not added")
        print("OK")
        print("Try to edit 'forwared to...' number...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "Number")]').click()
        fill_element(driver, "/html/body//label//div//input", 'TestNumber')
        driver.find_element(By.XPATH, '/html/body//div/button[contains(., "Set")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div[contains(., "TestNumber")]')) > 0,
            "'forward to...' number was not changed")
        print("OK")
        print("Try to add a second condition 'office hours are...'...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]').click()
        driver.find_element(By.XPATH, '//div[@data-cy="csc-condtion-office-hours"]').click()
        fill_element(driver, '/html/body//div[1]/label//div//input[@aria-label="Start time"]', '1200')
        fill_element(driver, '/html/body//div[2]/label//div//input[@aria-label="End time"]', '1800')
        driver.find_element(By.XPATH, '/html/body//div//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "Monday, Tuesday, Wednesday, Thursday, Friday")]')) > 0,
            "'Office hours are...' condition is not correct")
        print("OK")
        print("Try to delete second condition...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "Monday")]').click()
        driver.find_element(By.XPATH, '/html/body//div//button[contains(., "Delete")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]')) > 0,
            "Second condition was not deleted")
        print("OK")
        print("Try to add second condition 'date is...'...", end="")
        day = datetime.today().day
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]').click()
        driver.find_element(By.XPATH, '//div[@data-cy="csc-condtion-date"]').click()
        driver.find_element(By.XPATH, '/html/body//div//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        if day < 10:
            day = "0" + str(day)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div[@data-cy="q-item-label"]/span[contains(., "' + datetime.today().strftime('%Y/%m/') + str(day) + '")]')) > 0,
            "'Office hours are...' condition is not correct")
        print("OK")
        print("Try to delete second condition...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "' + datetime.today().strftime('%Y/%m/') + str(day) + '")]').click()
        driver.find_element(By.XPATH, '/html/body//div//button[contains(., "Delete")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "condition")]')) > 0,
            "Second condition was not deleted")
        print("OK")
        print("Try to delete first condition...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[contains(., "TestUser")]').click()
        driver.find_element(By.XPATH, '//button[@data-cy="csc-call-select-delete"]').click()
        wait_for_invisibility(driver, '/html/body/div[3]/div/div[4]/svg')
        print("OK")
        print("Try to add another foward...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div/div/div[1]/div[2]/button').click()
        driver.find_element(By.XPATH, '//div[@data-cy="csc-forwarding-to-voicebox"]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[3]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div[contains(., "Voicebox")]')) > 0, "Voicebox forwarding was not added")
        print("OK")
        print("Try to change the amount of time before it switches to the next forward...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[1][contains(., "seconds")]').click()
        fill_element(driver, '/html/body//div/label//div//input', "30")
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div/button[contains(., "Set")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div/span[1][contains(., "30")]')) > 0,
            "Voicebox forwarding time was not changed")
        print("OK")
        print("Try to disable a call forward...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div/div/div[1]/div[2]/button').click()
        driver.find_element(By.XPATH, '/html/body//div[@class="q-list q-list--dark"]/div[contains(., "Disable")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[4]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]//div[@class="q-item__section column q-item__section--main justify-center disabled"]')) > 0,
            "Call forward was not disabled")
        print("OK")
        print("Try to enable a call forward...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div/div/div[1]/div[2]/button').click()
        driver.find_element(By.XPATH, '/html/body//div[@class="q-list q-list--dark"]/div[contains(., "Enable")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[4]/svg')
        print("OK")
        print("Try to delete call forwarding...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div/div/div[1]/div[2]/button').click()
        driver.find_element(By.XPATH, '/html/body//div[@class="q-list q-list--dark"]/div[contains(., "Remove")]').click()
        driver.find_element(By.XPATH, '/html/body//div/div[3]/button[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        self.assertTrue(
            driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div/div[1]/div/div').text == "Always", "Call forward was not deleted")
        filename = 0

    def test_fax_settings(self):
        global customers
        global filename
        if os.environ.get('vmtype') == "CE":
            print("Running CE, test is skipped...")
            filename = 0
            return True
        filename = "test_fax_settings.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Fax Settings' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Fax Settings")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-main"]')) > 0, "Fax page wasnt opened")
        print("OK")
        print("Try to add a new destination...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main/div[2]/div[1]/div[5]/div[2]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main//div//button[contains(., "Add destination")]').click()
        fill_element(driver, '//*[@id="csc-page-main"]/main//div//label//input[@aria-label="Destination Email"]', "testdestination@test.com")
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main//div//label[2]').click()
        driver.find_element(By.XPATH, '/html/body//div[contains(., "PDF")]').click()
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main//div//button[contains(., "Create destination")]').click()
        print("OK")
        print("Check if destination is correct...", end="")
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-main"]//main//div[contains(., "<testdestination@test.com> as PDF")]')) > 0, "Destination was not found")
        print("OK")
        print("Try to edit Fax destination. Disabling 'Deliver incoming/outgoing Faxes'...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main/div[2]/div[1]/div[5]/div[2]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main//div[@data-cy="csc-list-item"]').click()
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main/div[2]//div[@aria-label="Deliver Incoming Faxes"]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main/div[2]/div[1]/div[5]/div[2]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main/div[2]//div[@aria-label="Deliver Outgoing Faxes"]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main/div[2]/div[1]/div[5]/div[2]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main//div[@data-cy="csc-list-item"]/div[1]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main//div/i[contains(., "call_recieved")]')
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main//div/i[contains(., "call_made")]')
        print("OK")
        print("Try to activate sendfax...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-main"]/main//div[@aria-label="Active"]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]/button[1]')) > 0, "Fax button was not found")
        print("OK")
        print("Try to send a fax to a test destination...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-main"]/main/div[2]/div[1]/div[5]/div[2]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-main"]/button[1]').click()
        driver.find_element(By.XPATH, '/html/body/div[contains(., "Send Fax")]').click()
        fill_element(driver, '/html/body//div//label//div/input[@aria-label="Destination Number"]', '999999')
        fill_element(driver, '/html/body//div//label//div/input[@aria-label="Page Header"]', 'Test')
        fill_element(driver, '/html/body//div//label//div/textarea[@aria-label="Content"]', 'This is a test Text')
        driver.find_element(By.XPATH, '/html/body//div//button[contains(., "Send")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]//div[contains(., "Sending fax completed")]')) > 0, "Fax was not sent")
        print("OK")
        filename = 0

    def test_login_page(self):
        global customers
        global filename
        filename = "test_login_page.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with no credentials...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with invalid credentials...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "invaliduser")
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "invalidpass")
        driver.find_element(By.XPATH, '//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with invalid password...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "invalidpass")
        driver.find_element(By.XPATH, '//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with empty password...", end="")
        driver.get(os.environ['CATALYST_SERVER'])
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        driver.find_element(By.XPATH, '//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]')) > 0, "Error Message was not shown")
        print("OK")
        print("Try to log in with valid credentials...", end="")
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', "testuser@" + self.domainname)
        fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', "testpasswd")
        driver.find_element(By.XPATH, '//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Try to log out...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-main"]/button[contains(., "testuser")]').click()
        driver.find_element(By.XPATH, '//div[@data-cy="user-logout"]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-login"]')) > 0,
            "Logout wasnt successful")
        print("OK")
        print("Trying to change to every available language...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div/div[3]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-login-card"]/div[contains(., "Teilnehmer-Anmeldung")]')) > 0,
            "Language wasnt changed to German")
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div/div[4]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-login-card"]/div[contains(., "Iniciar sesión de suscriptor")]')) > 0,
            "Language wasnt changed to Spanish")
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div/div[5]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-login-card"]/div[contains(., "Authentification de l’abonné")]')) > 0,
            "Language wasnt changed to French")
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div/div[6]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-login-card"]/div[contains(., "Accesso abbonato")]')) > 0,
            "Language wasnt changed to Italian")
        driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-login"]/button').click()
        click_js(driver, '/html/body/div[3]/div/div[2]')
        wait_for_invisibility(driver, '//*[@id="csc-language-menu-login"]')
        time.sleep(1)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-login-card"]/div[contains(., "Subscriber Sign In")]')) > 0,
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
        driver.find_element(By.XPATH, '//*[@id="csc-login-card"]//button[contains(., "Sign In")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Start new call' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]/a[contains(., "Start new call")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-call"]')) > 0, "Start new call page wasnt opened")
        print("OK")
        print("Go to 'Conversations' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]/a[contains(., "Conversations")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-conversations"]')) > 0, "Conversations page wasnt opened")
        print("OK")
        print("Trying to go through every subpage...", end="")
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-conversations"]//div[contains(., "No Calls, Voicemails or Faxes found")]')) > 0,
            "Sub page 'All' wasnt opened")
        driver.find_element(By.XPATH, '//*[@id="csc-page-conversations"]//div[@role="tablist"]/div/div[2]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-conversations"]//div[contains(., "No Calls found")]')) > 0,
            "Sub page 'Calls' wasnt opened")
        driver.find_element(By.XPATH, '//*[@id="csc-page-conversations"]//div[@role="tablist"]/div/div[3]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-conversations"]//div[contains(., "No Voicemails found")]')) > 0,
            "Sub page 'Voicemails' wasnt opened")
        driver.find_element(By.XPATH, '//*[@id="csc-page-conversations"]//div[@role="tablist"]/div/div[4]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-conversations"]//div[contains(., "No Faxes found")]')) > 0,
            "Sub page 'Faxes' wasnt opened")
        print("OK")
        print("Go to 'General'...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "General")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]//div[contains(., "Music on Hold")]')) > 0,
            "General page wasnt opened")
        print("OK")
        print("Try to enable 'Music on Hold'...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-voicebox"]/div/div[1]/div[2]/svg')
        click_js(driver, '//*[@id="csc-page-voicebox"]//div[@aria-label="Music on Hold"]/div[1]')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]//div[@aria-checked="true"]')) > 0,
            "Music on Hold was not enabled")
        print("OK")
        print("Go to 'Privacy' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Privacy")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-privacy"]')) > 0, "Privacy page wasnt opened")
        print("OK")
        print("Try to enable privacy settings...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-call-blocking-privacy"]/div/div/div[2]/svg')
        click_js(driver, '//div[@data-cy="csc-privacy-hide"]')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//div[@data-cy="csc-privacy-hide"][@aria-checked="true"]')) > 0,
            "'Hide your number to the callee' wasnt enabled")
        click_js(driver, '//*[@id="csc-page-call-blocking-privacy"]/div/div[2]/div[1]/div')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-blocking-privacy"]/div/div[2]/div[1]/div[@aria-checked="true"]')) > 0,
            "'Hide number to the callee within own PBX' wasnt enabled")
        filename = 0

    def test_recording(self):
        global customers
        global filename
        now = datetime.now()
        filename = "test_recording.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Recordings' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Recordings")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-recording"]')) > 0, "Recordings page wasnt opened")
        print("OK")
        print("Add a timerange filter and check if they got created...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]//div//button[contains(., "Filter")]').click()
        click_js(driver, '//*[@id="csc-page-call-recording"]//div[@data-cy="csc-call-recording-filters"]//label[1]/div/div/div[1]')
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div[2]/div[1]').click()
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]/div[1]/div/div[3]/div/div[1]/div[2]/label[1]/div/div/div[1]').click()
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div/div[2]/div[2]/div/button').click()
        checkstring = "Start time: " + now.strftime("%Y-%m-%d") + " 00:00"
        print(checkstring)
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-recording"]//div[contains(., "' + checkstring + '")]')) > 0,
            "Start timerange could not be found")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]/div[1]/div/div[3]/div/div[1]/div[2]/label[2]/div/div/div[1]').click()
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div/div[2]/div[2]/div/button').click()
        checkstring = "End time: " + now.strftime("%Y-%m-%d") + " 00:00"
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-recording"]//div[contains(., "' + checkstring + '")]')) > 0,
            "End timerange could not be found")
        print("OK")
        print("Try to remove the End time...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]//div[contains(., "End time:")]/../i[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-call-recording"]//div[contains(., "End time:")]/../i[2]')
        print("OK")
        print("Add filter by CallID...", end="")
        click_js(driver, '//*[@id="csc-page-call-recording"]//div[@data-cy="csc-call-recording-filters"]//label[1]/div/div/div[1]')
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div[2]/div[4]').click()
        fill_element(driver, '//*[@id="csc-page-call-recording"]//div//label//input[@aria-label="CallID"]', "TestCallID")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]/div[1]/div/div[3]/div/div[1]/div[2]/label/div/div/div[2]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-recording"]//div[contains(., "CallID: TestCallID")]')) > 0,
            "Call ID could not be found")
        print("OK")
        print("Try to delete all filters...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]//div[contains(., "Start time:")]/../i[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-call-recording"]//div[contains(., "Start time:")]/../i[2]')
        driver.find_element(By.XPATH, '//*[@id="csc-page-call-recording"]//div[contains(., "CallID:")]/../i[2]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-call-recording"]//div[contains(., "CallID:")]/../i[2]')
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
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Reminder' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Reminder")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-reminder"]')) > 0, "Reminder page wasnt opened")
        print("OK")
        print("Try to enable reminders...", end="")
        wait_for_invisibility(driver, '//div[@data-cy="csc-reminder-toggle"][@aria-disabled="true"]')
        driver.find_element(By.XPATH, '//div[@data-cy="csc-reminder-toggle"]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//div[@data-cy="csc-reminder-toggle"][@aria-checked="true"]')) > 0,
            "Reminder has not been enabled")
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Speed Dial")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Reminder")]').click()
        print("OK")
        print("Try to change reminder recurrance to 'Always'...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-reminder"]//div[@aria-label="Always"]').click()
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '/html/body//div[@role="alert"]')))
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-reminder"]//div[@aria-label="Always"][@aria-checked="true"]')) > 0,
            "Reminder recurrance has not been changed to 'always'")
        print("OK")
        print("Try to change time to 12:00...")
        driver.find_element(By.XPATH, '//*[@id="csc-page-reminder"]/div/div[3]/div/label/div/div/div[2]/input').click()
        driver.find_element(By.XPATH, '//*[@id="csc-page-reminder"]/div/div[3]/div/label/div/div/div[2]/input').click()
        fill_element(driver, '//*[@id="csc-page-reminder"]/div/div[3]/div/label/div/div/div[2]/input', '1200')
        print(driver.find_element(By.XPATH, '//*[@id="csc-page-reminder"]//div[@aria-label="Always"][@aria-checked="true"]').get_attribute("value"))
        self.assertTrue(
            driver.find_element(By.XPATH, '//*[@id="csc-page-reminder"]/div//label//div//input').get_attribute("value") == '12:00',
            "Time has not been changed")
        filename = 0

    def test_security(self):
        global customers
        global filename
        filename = "test_security.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Forwarding")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-call-forwarding"]')) > 0, "Conference page wasnt opened")
        print("OK")
        print("Create a call forwarding 'if available'...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]/div[1]/button/span[3]/svg[@class="q-spinner text-primary"]')
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]//button[contains(., "Add forwarding")]/span/svg')
        click_js(driver, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')
        click_js(driver, '//div[@data-cy="csc-add-forwarding-available"]')
        print("OK")
        print("Create a call forwarding 'if not available'...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]/div[1]/button/span[3]/svg[@class="q-spinner text-primary"]')
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]//button[contains(., "Add forwarding")]/span/svg')
        click_js(driver, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')
        click_js(driver, '//div[@data-cy="csc-add-forwarding-not-available"]')
        print("OK")
        print("Create a call forwarding 'if busy'...", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]/div[1]/button/span[3]/svg[@class="q-spinner text-primary"]')
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]//button[contains(., "Add forwarding")]/span/svg')
        click_js(driver, '//*[@id="csc-page-call-forwarding"]//div//button[contains(., "Add forwarding")]')
        click_js(driver, '//div[@data-cy="csc-add-forwarding-busy"]')
        print("OK")
        print("Add test string to all call forwardings", end="")
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]/div[1]/button/span[3]/svg[@class="q-spinner text-primary"]')
        wait_for_invisibility(driver, '//*[@id="csc-page-call-forwarding"]//button[contains(., "Add forwarding")]/span/svg')
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div[1]//div/span[contains(., "Number")]').click()
        fill_element(driver, "/html/body//label//div//input", "checking <script>alert('test')</script> asdфывфів123!@#$%^&*()_+[]\|}{;'\":,./?><EOL")
        driver.find_element(By.XPATH, '/html/body//div/button[contains(., "Set")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]//div[contains(., "Failed to create cfdestinationset.")]')) > 0, "Illegal call foward was created")
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div[2]//div/span[contains(., "Number")]').click()
        fill_element(driver, "/html/body//label//div//input", "checking <script>alert('test')</script> asdфывфів123!@#$%^&*()_+[]\|}{;'\":,./?><EOL")
        driver.find_element(By.XPATH, '/html/body//div/button[contains(., "Set")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]//div[contains(., "Failed to create cfdestinationset.")]')) > 0, "Illegal call foward was created")
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        driver.find_element(By.XPATH, '//*[@id="csc-wrapper-call-forwarding"]/div[3]//div/span[contains(., "Number")]').click()
        fill_element(driver, "/html/body//label//div//input", "checking <script>alert('test')</script> asdфывфів123!@#$%^&*()_+[]\|}{;'\":,./?><EOL")
        driver.find_element(By.XPATH, '/html/body//div/button[contains(., "Set")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '/html/body//div[@role="alert"]//div[contains(., "Failed to create cfdestinationset.")]')) > 0, "Illegal call foward was created")
        wait_for_invisibility(driver, '//*[@id="csc-wrapper-call-forwarding"]/div/div[2]/div[4]/svg')
        print("OK")
        filename = 0

    def test_speed_dial(self):
        global customers
        global filename
        filename = "test_speed_dial.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        print("Try to log in with valid credentials...", end="")
        login_csc(driver, "testuser@" + self.domainname, 'testpasswd')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Speed Dial")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-speed-dial"]')) > 0, "Speed dial page wasnt opened")
        print("OK")
        print("Try to create a new Speed Dial...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-speed-dial"]//div/button').click()
        driver.find_element(By.XPATH, '//*[@id="csc-page-speed-dial"]//div/label').click()
        driver.find_element(By.XPATH, '//*[contains(., "*5")]').click()
        fill_element(driver, '//*[@id="csc-page-speed-dial"]//div/label[2]//div/input[@aria-label="Destination"]', "testination")
        click_js(driver, '//*[@id="csc-page-speed-dial"]//button[contains(., "Save")]')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-speed-dial"]//div[@data-cy="csc-speeddial-whendial"][contains(., "When I dial *6")]')) > 0,
            "Speed dial button is not correct")
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-speed-dial"]//div[@data-cy="csc-speeddial-ring"][contains(., "testination")]')) > 0,
            "Speed dial destination is not correct")
        print("OK")
        print("Try to delete the speed dial...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-speed-dial"]//div//button[@data-cy="csc-speeddial-more"]').click()
        driver.find_element(By.XPATH, '/html/body//div[@data-cy="csc-speeddial-remove"]').click()
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div[2]/div/div[3]/button[2]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-speed-dial"]/div[2]/div[contains(., "No speed dials found")]')) > 0,
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
            len(driver.find_elements(By.XPATH, '//*[@id="csc-header-toolbar-main"]')) > 0, "Login wasnt successful")
        print("OK")
        print("Go to 'Call Forwarding' page...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div[contains(., "Call Settings")]').click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="csc-main-menu-top"]//div/a[contains(., "Voicebox")]').click()
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]')) > 0, "Conference page wasnt opened")
        print("OK")
        print("Try to enter invalid PIN...", end="")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]')))
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]', "asdf")
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]//div/i[contains(., "error")]')) > 0,
            "Wrong PIN has not been detected")
        print("OK")
        print("Try to enter valid PIN...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div/button[contains(., "Undo")]').click()
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]', "12345")
        driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-voicebox"]//div/label[aria-disabled="true"]//input[@data-cy="voicebox-change-pin"]')
        self.assertTrue(
            driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change PIN"]').get_attribute("value") == "12345",
            "Changed PIN is not correct")
        print("OK")
        print("Try to enter an invalid Email...", end="")
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]', "test")
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]//div/i[contains(., "error")]')) > 0,
            "Wrong Email has not been detected")
        driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div/button[contains(., "Undo")]').click()
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]', "test@test")
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]//div/i[contains(., "error")]')) > 0,
            "Wrong Email has not been detected")
        print("OK")
        print("Try to enter a valid Email...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div/button[contains(., "Undo")]').click()
        fill_element(driver, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]', "test@test.com")
        driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div//button[contains(., "Save")]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-voicebox"]//div/label[aria-disabled="true"]//input[@data-cy="voicebox-change-email"]')
        self.assertTrue(
            driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div//input[@aria-label="Change Email"]').get_attribute("value") == "test@test.com",
            "Changed Email is not correct")
        print("OK")
        print("Try to disable 'Attach voicemail to email' setting...", end="")
        driver.find_element(By.XPATH, '//*[@id="csc-page-voicebox"]//div[@aria-label="Attach voicemail to email notification"]').click()
        wait_for_invisibility(driver, '//*[@id="csc-page-voicebox"]/div/div[3]/div[2]/svg')
        self.assertTrue(
            len(driver.find_elements(By.XPATH, '//*[@id="csc-page-voicebox"]/div/div[5]/div[1]/div[@aria-disabled="true"]')) > 0,
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
