import unittest
import os
import nose2
import functions.Collections as Collections
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


class test_login(unittest.TestCase):
    def setUp(self):
        profile = webdriver.FirefoxProfile()
        profile.accept_untrusted_certs = True
        caps = DesiredCapabilities().FIREFOX
        caps["pageLoadStrategy"] = "normal"
        self.driver = webdriver.Firefox(
            capabilities=caps, firefox_profile=profile, log_path='/dev/null')
        self.driver.implicitly_wait(10)
        self.driver.set_page_load_timeout(10)

    def test_login(self):
        driver = self.driver
        Collections.create_subscriber(driver)
        driver.find_element_by_link_text('Expand Groups').click()
        domainname = driver.find_element_by_xpath(
            '//*[@id="subscribers_table"]//tr[1]/td[3]').text
        driver.get(os.environ['CATALYST_SERVER'])
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="text"]'
        ).send_keys('invalid')
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="password"]'
        ).send_keys('user')
        driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div//button').click()
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="text"]'
        ).send_keys(Keys.CONTROL + "a")
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="text"]'
        ).send_keys(Keys.DELETE)
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="text"]'
        ).send_keys('testuser@' + domainname)
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="password"]'
        ).send_keys(Keys.CONTROL + "a")
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="password"]'
        ).send_keys(Keys.DELETE)
        driver.find_element_by_xpath(
            '//*[@id="csc-login-form"]//div//input[@type="password"]'
        ).send_keys('testpasswd')
        driver.find_element_by_xpath(
            '//*[@id="csc-login"]//div//button').click()
        self.assertEqual("testuser", (driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]//div//span[contains(text(), '
            '"testuser")]').text)
        )
        WebDriverWait(driver, 1)

    def tearDown(self):
        driver = self.driver
        try:
            Collections.delete_subscriber(driver)
            driver.close()
        except Exception:
            driver.close()


if __name__ == '__main__':
    nose2.main()
