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


class testrun(unittest.TestCase):
    def setUp(self):
        profile = webdriver.FirefoxProfile()
        profile.accept_untrusted_certs = True
        caps = DesiredCapabilities().FIREFOX
        caps["pageLoadStrategy"] = "normal"
        self.driver = webdriver.Firefox(
            capabilities=caps, firefox_profile=profile, log_path='/dev/null')
        self.driver.implicitly_wait(10)
        self.driver.set_page_load_timeout(10)
        Collections.create_subscriber(self.driver)

    def test_login_logout(self):
        driver = self.driver
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
        self.assertTrue(driver.find_element_by_xpath(
            '/html/body/div[contains(@class, "q-alert-container")]')
            .is_displayed(), "Error Message was shown")
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
        self.assertEqual("testuser", driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]//div//span[contains(text(), '
            '"testuser")]').text, "Successfully logged in")
        driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]/div[1]/button').click()
        driver.find_element_by_xpath(
            '/html/body//div[contains(text(), "Logout")]').click()
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_speed_dial(self):
        driver = self.driver
        driver.find_element_by_link_text('Expand Groups').click()
        domainname = driver.find_element_by_xpath(
            '//*[@id="subscribers_table"]//tr[1]/td[3]').text
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]').click()
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
            .text, "When I dial *1 ...")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-sublabel"]'
            '[contains(text(), "ring")]')
            .text, "ring testtext")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[@slot="right"]').click()
        driver.find_element_by_xpath(
            '/html/body//div[@class="modal-buttons row"]//button'
            '[contains(@class, "text-negative")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "No speed dials found")]')
            .is_displayed())
        Collections.logout(driver)

    def tearDown(self):
        driver = self.driver
        try:
            Collections.delete_subscriber(driver)
            driver.close()
        except Exception:
            driver.close()


if __name__ == '__main__':
    nose2.main()
