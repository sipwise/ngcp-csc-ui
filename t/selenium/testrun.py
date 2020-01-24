import unittest
import os
import traceback
from multiprocessing import Value
import nose2
import time
import functions.Collections as Collections
import functions.Functions as Functions
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
    driver = Functions.create_driver()
    Collections.login_panel(driver)
    for i in range(0, int(os.environ['THREADS'])):
        customers[Collections.create_customer(
            driver)] = Collections.create_domain(driver)
    del i
    for customer in customers.keys():
        Collections.create_subscriber(driver, customer, customers[customer])
    driver.quit()


def cleanup():
    global customers
    driver = Functions.create_driver()
    Collections.login_panel(driver)
    for customer in customers:
        Collections.delete_customer(driver, customer)
        Collections.delete_domain(driver, customers[customer])
    driver.quit()


class testrun(unittest.TestCase):

    def setUp(self):
        global execs
        global customers
        self.driver = Functions.create_driver()
        self.longMessage = True
        execs.value += 1
        key = list(customers.keys())[execs.value % int(os.environ['THREADS'])]
        self.domainname = customers[key]

    def test_login_page(self):
        global customers
        global filename
        filename = "test_login_page.png"
        driver = self.driver
        driver.get(os.environ['CATALYST_SERVER'])
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="text"]'
        ).send_keys('invalid')
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="password"]'
        ).send_keys('user')
        driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div//button').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//div[contains(@class, "q-alert-container")]')
            .is_displayed(), "Error Message was not shown")
        Functions.fill_element(
            driver, '//*[@id="csc-login-form"]//div//input[@type='
            '"text"]', "testuser@" + self.domainname)
        Functions.fill_element(
            driver, '//*[@id="csc-login-form"]//div//input[@type='
            '"password"]', "testpasswd")
        driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div//button').click()
        self.assertEqual("testuser", driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]//div//span[contains(text(), '
            '"testuser")]').text, "Login failed")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '//div[contains(text(), "Logout")]').click()
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[2]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains'
            '(text(), "Authentification de l’abonné")]').is_displayed(),
            'Language was not changed to France')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[3]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains'
            '(text(), "Accedi come utente")]').is_displayed(),
            'Language was not changed to Italian')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[4]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains'
            '(text(), "Iniciar sesión de suscriptor")]').is_displayed(),
            'Language was not changed to Spanish')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[5]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains'
            '(text(), "Subscriber Log-in")]').is_displayed(),
            'Language was not changed to German')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[1]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div[@class="q-card-title"][contains'
            '(text(), "Subscriber Sign In")]').is_displayed(),
            'Language was not changed back to English')
        filename = 0

    def test_call_blocking(self):
        global customers
        global filename
        filename = "test_call_blocking.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Blocking")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Blocking")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Incoming")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Incoming")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only incoming calls")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only incoming calls")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div/button[contains(@class, '
            '"q-btn-flat")]/span[contains(@class, "q-btn-inner")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]'
            '/span[contains(@class, "q-btn-inner")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@type="text"]').send_keys('12345')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-form-actions row justify-center'
            '"]/button[2]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]/div[contains(@class, "active")]').is_displayed(),
            "Option 'All anonymous incoming calls are blocked' was not "
            "enabled")
        self.assertEqual("12345", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number '
            'csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]'
            '/div[1]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div/input[@class="col q-input-target'
            ' text-left"]', '54321')
        elem = driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//i[text()="check"]')
        driver.execute_script("arguments[0].click();", elem)
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element((
            By.XPATH, '//*[@id="q-app"]//div[@class="csc-spinner"]/svg')))
        driver.implicitly_wait(10)
        self.assertEqual("54321", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number '
            'csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "csc-dialog-actions")]/button[contains'
            '(@class, "text-negative")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-list-message"]'
            '[contains(text(), "No numbers found")]').is_displayed(),
            "Number has not been deleted")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Outgoing")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Outgoing")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only outgoing calls")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only outgoing calls")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div/button[contains(@class, '
            '"q-btn-flat")]/span[contains(@class, "q-btn-inner")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]'
            '/span[contains(@class, "q-btn-inner")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@type="text"]').send_keys('12345')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-form-actions row justify-center'
            '"]/button[2]').click()
        self.assertEqual("12345", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number '
            'csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]'
            '/div[1]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div/input[@class="col q-input-target'
            ' text-left"]', '54321')
        elem = driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//i[text()="check"]')
        driver.execute_script("arguments[0].click();", elem)
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//*[@id="q-app"]//div[@class="csc-spinner"]/svg')))
        driver.implicitly_wait(10)
        self.assertEqual("54321", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number '
            'csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is not correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]').click()
        driver.find_element_by_xpath(
            '//div[@class="csc-item-buttons-menu q-list no-border"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "csc-dialog-actions")]/button[contains'
            '(@class, "text-negative")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-list-message"]'
            '[contains(text(), "No numbers found")]').is_displayed(),
            "Number has not been deleted")
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Privacy")]/div[@class="q-inner-loading '
            'animate-fade absolute-full column flex-center"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Privacy")]/div[@class="q-inner-loading '
            'animate-fade absolute-full column flex-center"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Privacy")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]')))
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-toggle")]//span'
            '[contains(text(), "Your number is hidden")]').is_displayed(),
            "Option 'hide number' was not enabled")
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_call_forward_after_hours(self):
        global customers
        global filename
        filename = "test_call_forward_after_hours.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Forward")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Forward")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "After Hours")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "After Hours")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-alert-actions row items-center"]'
            '/span[contains(text(), "Add After Hours")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-'
            'division relative-position"]//div[@class="q-item- row no-wrap"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]'
            '//div[contains(@class, "q-datetime-clock-pos-8")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]'
            '/button[3]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-'
            'division relative-position"]//div[@class="q-item- row no-wrap"]'
            '/div[3]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]'
            '//div[contains(@class, "q-datetime-clock-pos-16")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]'
            '/button[3]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//'
            'div[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button'
            '/span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div'
            '[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "200")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button/'
            'span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        Functions.click_js(
            driver,
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]'
            '/div[@tabindex="0"]/div[@class="q-option-inner '
            'relative-position"]')
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle"'
            ')]/div[@class="q-option-inner relative-position '
            'active"]').is_displayed(), "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'first ring own phone for 15 secs', "Option 'first ring ' "
            "own Phone for 15 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'then ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring testdestination for 200 secs', "Option "
            "'Ring testdestination for 200 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im busy' is missing")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-tab column flex-center '
            'relative-position icon-and-label"]//span[contains'
            '(text(), "Add new")]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/'
            'div[1]//input', 'firsttestsourceset')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/'
            'div[2]//input', 'firsttestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div'
            '[@tabindex=0]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="q-popover animate-scale column no-wrap"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/span[contains'
            '(text(), "firsttestsourceset")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "firsttestsource")]'
            ).is_displayed(), "Source was not found")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/button').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="add-source-form"]//input',
            'newtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-source-form"]/button[2]'
            ).click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'
            ).is_displayed(), "Second Source was not found")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]/../'
            'div[2]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body//div[@class="modal-buttons row"]/'
            'button[2]')))
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//*[@id="q-app"]//div[@class="sources-section"]/div'
            '[@class="q-list no-border q-list-striped-odd"]/div[2]')))
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'),
            "Second Source was not deleted")
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "firsttestsource")]/../'
            'div[2]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '/html/body//div[@class="q-alert row no-wrap shadow-2 '
            'bg-negative"]').is_displayed(), "Error Message 'Removing the "
            "last source entry is not allowed' did not appear")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[1]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//'
            'div[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button'
            '/span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]/div[@class="q-item'
            '-side q-item-side-right q-item-section dest-btns cursor-pointer"]'
            ).click()
        driver.find_element_by_xpath(
            '/html/body/div[@class="q-popover animate-scale"]/div/div[1]'
            ).click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring Voicebox', "Options did not get swapped"
            )
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/div/button'
            '[@align="right"]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body//div[@class="modal-buttons row"]/'
            'button[2]')))
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        time.sleep(1)
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div/span[contains'
            '(text(), "firsttestsourceset")]'),
            "Second Source Set was not deleted")
        driver.implicitly_wait(10)
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_call_forward_always(self):
        global customers
        global filename
        filename = "test_call_forward_always.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Forward")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Forward")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Always")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Always")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//'
            'div[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button'
            '/span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div'
            '[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "200")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button/'
            'span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[3]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "300")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button/'
            'span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[3]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        Functions.click_js(
            driver,
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]'
            '/div[@tabindex="0"]/div[@class="q-option-inner '
            'relative-position"]')
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle"'
            ')]/div[@class="q-option-inner relative-position '
            'active"]').is_displayed(), "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'first ring own phone for 15 secs', "Option 'first ring ' "
            "own Phone for 15 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'then ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring testdestination for 200 secs', "Option "
            "'Ring testdestination for 200 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im busy' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfna"]/div[1]//div[@class="dest'
            '-row"]').text, 'first ring testdestination for 300 secs', "Option"
            " 'Ring testdestination for 300 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfna"]/div[2]//div[@class="dest'
            '-row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im offline' is missing")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-tab column flex-center '
            'relative-position icon-and-label"]//span[contains'
            '(text(), "Add new")]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/'
            'div[1]//input', 'secondtestsourceset')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/'
            'div[2]//input', 'secondtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div'
            '[@tabindex=0]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="q-popover animate-scale column no-wrap"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/span[contains'
            '(text(), "secondtestsourceset")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "secondtestsource")]'
            ).is_displayed(), "Source was not found")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/button').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="add-source-form"]//input',
            'newtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-source-form"]/button[2]'
            ).click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'
            ).is_displayed(), "Second Source was not found")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]/../'
            'div[2]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body//div[@class="modal-buttons row"]/'
            'button[2]')))
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//*[@id="q-app"]//div[@class="sources-section"]/div'
            '[@class="q-list no-border q-list-striped-odd"]/div[2]')))
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'),
            "Second Source was not deleted")
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "secondtestsource")]/../'
            'div[2]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '/html/body//div[@class="q-alert row no-wrap shadow-2 '
            'bg-negative"]').is_displayed(), "Error Message 'Removing the "
            "last source entry is not allowed' did not appear")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[1]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//'
            'div[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button'
            '/span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]/div[@class="q-item'
            '-side q-item-side-right q-item-section dest-btns cursor-pointer"]'
            ).click()
        driver.find_element_by_xpath(
            '/html/body/div[@class="q-popover animate-scale"]/div/div[1]'
            ).click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring Voicebox', "Options did not get swapped"
            )
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/div/button'
            '[@align="right"]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body//div[@class="modal-buttons row"]/'
            'button[2]')))
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        time.sleep(1)
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div/span[contains'
            '(text(), "secondtestsourceset")]'),
            "Second Source Set was not deleted")
        driver.implicitly_wait(10)
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_call_forward_company_hours(self):
        global customers
        global filename
        filename = "test_call_forward_company_hours.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Forward")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Call Forward")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Company Hours")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Company Hours")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-alert-actions row items-center"]'
            '/span[contains(text(), "Add Company Hours")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-'
            'division relative-position"]//div[@class="q-item- row no-wrap"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]'
            '//div[contains(@class, "q-datetime-clock-pos-8")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]'
            '/button[3]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-add-time-form q-item q-item-'
            'division relative-position"]//div[@class="q-item- row no-wrap"]'
            '/div[3]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]'
            '//div[contains(@class, "q-datetime-clock-pos-16")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]'
            '/button[3]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//'
            'div[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button'
            '/span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div'
            '[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "200")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button/'
            'span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        Functions.click_js(
            driver,
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]'
            '/div[@tabindex="0"]/div[@class="q-option-inner '
            'relative-position"]')
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle"'
            ')]/div[@class="q-option-inner relative-position '
            'active"]').is_displayed(), "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'first ring own phone for 15 secs', "Option 'first ring ' "
            "own Phone for 15 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'then ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring testdestination for 200 secs', "Option "
            "'Ring testdestination for 200 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfb"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im busy' is missing")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-tab column flex-center '
            'relative-position icon-and-label"]//span[contains'
            '(text(), "Add new")]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/'
            'div[1]//input', 'thirdtestsourceset')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/'
            'div[2]//input', 'thirdtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item- row no-wrap"]/div'
            '[@tabindex=0]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="q-popover animate-scale column no-wrap"]'
            '/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-"]/button').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/span[contains'
            '(text(), "thirdtestsourceset")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "thirdtestsource")]'
            ).is_displayed(), "Source was not found")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/button').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[@class="add-source-form"]//input',
            'newtestsource')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-source-form"]/button[2]'
            ).click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'
            ).is_displayed(), "Second Source was not found")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]/../'
            'div[2]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body//div[@class="modal-buttons row"]/'
            'button[2]')))
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//*[@id="q-app"]//div[@class="sources-section"]/div'
            '[@class="q-list no-border q-list-striped-odd"]/div[2]')))
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "newtestsource")]'),
            "Second Source was not deleted")
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "thirdtestsource")]/../'
            'div[2]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '/html/body//div[@class="q-alert row no-wrap shadow-2 '
            'bg-negative"]').is_displayed(), "Error Message 'Removing the "
            "last source entry is not allowed' did not appear")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[1]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//'
            'div[contains(text(), "Add Number")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Destination")]/..'
            '/input').send_keys('testdestination')
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Timeout")]/'
            '../input', "100")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="add-destination-form"]//button'
            '/span[contains(text(), "Save")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring testdestination for 100 secs', "Option "
            "'Ring testdestination for 100 secs' is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[2]//div[@class="dest-'
            'row"]').text, 'then ring Voicebox', "Option 'Ring Voicebox when "
            "im online' is missing")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]/div[@class="q-item'
            '-side q-item-side-right q-item-section dest-btns cursor-pointer"]'
            ).click()
        driver.find_element_by_xpath(
            '/html/body/div[@class="q-popover animate-scale"]/div/div[1]'
            ).click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
            ).text, 'do not ring own phone', "Option 'do not ring own phone' "
            "is missing")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@groupname="cfu"]/div[1]//div[@class="dest-'
            'row"]').text, 'first ring Voicebox', "Options did not get swapped"
            )
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="sources-section"]/div/button'
            '[@align="right"]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body//div[@class="modal-buttons row"]/'
            'button[2]')))
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]/button[2]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        time.sleep(1)
        self.assertFalse(driver.find_elements_by_xpath(
            '//*[@id="q-app"]//div/span[contains'
            '(text(), "thirdtestsourceset")]'),
            "Second Source Set was not deleted")
        driver.implicitly_wait(10)
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_conference_conversations(self):
        global customers
        global filename
        filename = "test_conference_conversations.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Join conference")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Join conference")]').click()
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
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Conversations")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Conversations")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Calls, '
            'Voicemails or Faxes found', "Section 'All' is not empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Calls")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Calls found',
            "Section 'Calls' is notempty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Faxes")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Faxes found',
            "Section 'Faxes' is not empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Voicemails")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Voicemails '
            'found', "Section 'Voicemails' is not empty")
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_reminder(self):
        global customers
        global filename
        filename = "test_reminder.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Reminder")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Reminder")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]//span[contains(text(), "Reminder")]')))
        time.sleep(1)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle"'
            ')]//span[contains(text(), "Reminder")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, '
            '"q-input-target justify-start")]')))
        time.sleep(1)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains'
            '(@class, "q-input-target justify-start")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]'
            '//div[contains(@class, "q-datetime-clock-pos-13")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-clock-circle")]'
            '//div[contains(@class, "q-datetime-clock-pos-7")]').click()
        driver.find_element_by_xpath(
            '//div[contains(@class, "q-datetime-controls")]'
            '/button[2]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@tabindex="0"]/span'
            '[@class="q-option-label"][contains(text(), "Always")]')))
        time.sleep(1)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]//span'
            '[contains(text(), "Always")]').click()
        self.assertEqual('Reminder is enabled', driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]//'
            'span[contains(text(), "Reminder")]').text,
            "Reminder is not enabled")
        self.assertEqual('13:35', driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains'
            '(@class, "q-input-target justify-start")]').text,
            "Time is not correct")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]/div'
            '[contains(@class, "active")]/../'
            'span[contains(text(), "Always")]').is_displayed(),
            "Option 'Always' was not selected")
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_settings(self):
        global customers
        global filename
        filename = "test_settings.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Reminder")]')))
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[2]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Rappel")]').is_displayed(),
            'Language was not changed to France')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[3]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Promemoria")]').is_displayed(),
            'Language was not changed to Italian')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[4]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Recordatorio")]').is_displayed(),
            'Language was not changed to Spanish')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[5]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Erinnerung")]').is_displayed(),
            'Language was not changed to German')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-item q-item-division relative-position q-item-link"]'
            )))
        Functions.click_js(
            driver, '/html/body/div[@class="q-popover animate-scale"]//div'
            '[@class="q-collapsible-sub-item relative-position"]/div[1]')
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Reminder")]').is_displayed(),
            'Language was not changed back to English')
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '/html/body//div[contains(text(), "Settings")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, '
            '"q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password"]/../'
            'input').send_keys('pass1234')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password retyped"]/../'
            'input').send_keys('pass1234')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center"]/'
            'button[2]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="csc-dialog-actions row justify-end'
            ' no-wrap"]/button[2]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="csc-login-form"]//div//input[@type="text"]')))
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'pass1234')
        self.assertEqual("testuser", driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]//div//span[contains(text(), '
            '"testuser")]').text, "Login failed")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '/html/body//div[contains(text(), "Settings")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, '
            '"q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password"]/..'
            '/input').send_keys('testpasswd')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[text() = "New password retyped"]/../'
            'input').send_keys('testpasswd')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center"]'
            '/button[2]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="csc-dialog-actions row justify-end'
            ' no-wrap"]/button[2]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="csc-login-form"]//div//input[@type="text"]')))
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_speed_dial(self):
        global customers
        global filename
        filename = "test_speed_dial.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]')))
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]').click()
        driver.implicitly_wait(2)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//button[contains'
            '(@class, "q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]').click()
        driver.find_element_by_xpath(
            '//*[@class="no-border scroll q-list q-list-link"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input'
            '[@class="col q-input-target text-left"]').send_keys("testtext")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center form-actions"]'
            '/button[contains(@class, "text-primary")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]'
            '/span[contains(text(), "When")]')
            .text, "When I dial *1 ...", "Speed dial has not been created")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-sublabel"]'
            '[contains(text(), "ring")]')
            .text, "ring testtext", "Speed dial is not correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div//button[contains'
            '(@class, "q-btn-rectangle")]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//button[contains'
            '(@class, "q-btn-rectangle")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]').click()
        driver.find_element_by_xpath(
            '//*[@class="no-border scroll q-list q-list-link"]/div[2]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input'
            '[@class="col q-input-target text-left"]').send_keys("asdf")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="row justify-center form-actions"]'
            '/button[contains(@class, "text-primary")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]'
            '/span[contains(text(), "*2")]')
            .text, "When I dial *2 ...", "Speed dial has not been created")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-sublabel"]'
            '[contains(text(), "asdf")]')
            .text, "ring asdf", "Speed dial is not correct")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[@slot="right"]').click()
        driver.find_element_by_xpath(
            '//div[@class="modal-buttons row"]//button[contains(@class, '
            '"text-negative")]').click()
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((
            By.XPATH, '//div[@class="q-toast-container active"]//div[contains'
            '(text(), "Unassigned slot *1")]')))
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div/button[@slot="right"]')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[@slot="right"]').click()
        driver.find_element_by_xpath(
            '//div[@class="modal-buttons row"]//button[contains(@class, '
            '"text-negative")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "No speed dials found")]')
            .is_displayed(), "Speed dials was not deleted")
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_voicebox(self):
        global customers
        global filename
        filename = "test_voicebox.png"
        driver = self.driver
        Collections.login_csc(
            driver, "testuser@" + self.domainname, 'testpasswd')
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Voicebox")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Voicebox")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(text(), "Change PIN")]'
            '/../input')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../'
            'input').send_keys("invalid")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-field-error col"'
            ']').is_displayed, "Invalid PIN was not detected")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../../'
            'i[1]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../'
            'input', "12345")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../../'
            'i[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../'
            'input').send_keys("invalid")
        self.assertTrue(driver.find_element_by_xpath(
                '//*[@id="q-app"]//div[@class="q-field-error col"'
                ']').is_displayed, "Invalid Email was not detected")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../../'
            'i[1]').click()
        Functions.fill_element(
            driver, '//*[@id="q-app"]//div[contains(text(), "Change Email")]'
            '/../input', "test@email.com")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../../'
            'i[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-toggle")]/span[contains'
            '(text(), "Delete voicemail")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../input')
            .get_attribute('value'), "12345", "PIN is not correct")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../input')
            .get_attribute('value'), "test@email.com", "Email is not correct")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-toggle-enabled")]'
            '/span[contains(text(), "Attach voicemail")]').is_displayed(),
            "Option 'Attach voicemail to email notification' was not enabled")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-toggle-enabled")]'
            '/span[contains(text(), "Delete voicemail")]').is_displayed(),
            "Option 'Delete voicemail after email notification is delivered' "
            "was not enabled")
        Collections.logout_csc(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def tearDown(self):
        global customers
        global filename
        driver = self.driver
        if filename:
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
