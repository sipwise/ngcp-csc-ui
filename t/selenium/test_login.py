import unittest
import os
import nose2
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


class TestStringMethods(unittest.TestCase):
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
        driver.get(os.environ['CATALYST_SERVER'] + ":1443")
        driver.find_element_by_xpath(
            '//*[@id="username"]').send_keys('administrator')
        driver.find_element_by_xpath(
            '//*[@id="password"]').send_keys('administrator')
        driver.find_element_by_xpath('//*[@id="submit"]').click()
        driver.find_element_by_xpath(
            '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
        driver.find_element_by_link_text('Customers').click()
        hoverclick = ActionChains(driver)
        hoverclick.move_to_element(driver.find_element_by_xpath(
            '//*[@id="Customer_table"]//tr[1]'))
        hoverclick.click(driver.find_element_by_xpath(
            '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), '
            '"Details")]')
        )
        hoverclick.perform()
        driver.find_element_by_link_text('Expand Groups').click()
        driver.execute_script(
            'arguments[0].scrollIntoView();',
            driver.find_element_by_link_text('Subscribers')
        )
        driver.find_element_by_link_text("Create Subscriber").click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
            (By.XPATH, '//*[@id="domainidtable_paginate"]/a[4]')))
        driver.find_element_by_xpath(
            '//*[@id="domainidtable_paginate"]/a[4]').click()
        driver.find_element_by_xpath(
            '//*[@id="domainidtable"]//tr[1]//td//input[@type="checkbox"]'
        ).click()
        driver.find_element_by_xpath(
            '//*[@id="webusername"]').send_keys('testuser')
        driver.find_element_by_xpath(
            '//*[@id="webpassword"]').send_keys('testpasswd')
        driver.find_element_by_xpath(
            '//*[@id="username"]').send_keys('testuser')
        driver.find_element_by_xpath(
            '//*[@id="password"]').send_keys('testpasswd')
        driver.find_element_by_xpath('//*[@id="save"]').click()
        WebDriverWait(driver, 10).until(EC.presence_of_element_located(
            (By.XPATH, '//*[@id="content"]//div[@class="alert alert-info"]')))
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
        assert True == (driver.find_element_by_xpath(
            '//div//span[contains(text(), "Wrong username or password")]'
        ).is_displayed())
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
        assert True == (driver.find_element_by_xpath(
            '//*[@id="q-app"]//div//main//div[contains(text(), "RTC:engine")]'
        ).is_displayed())
        assert "testuser" == (driver.find_element_by_xpath(
            '//*[@id="csc-header-toolbar"]//div//span[contains(text(), '
            '"testuser")]').text
        )
        WebDriverWait(driver, 1)

    def tearDown(self):
        driver = self.driver
        try:
            driver.get(os.environ['CATALYST_SERVER'] + ":1443")
        except Exception:
            driver.close()
            raise SystemExit
        url = os.environ['CATALYST_SERVER'] + ":1443" + "/login/admin"
        if driver.current_url == url:
            driver.find_element_by_xpath(
                '//*[@id="username"]').send_keys('administrator')
            driver.find_element_by_xpath(
                '//*[@id="password"]').send_keys('administrator')
            driver.find_element_by_xpath('//*[@id="submit"]').click()
        driver.find_element_by_xpath(
            '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
        driver.find_element_by_link_text('Customers').click()
        hoverclick = ActionChains(driver)
        hoverclick.move_to_element(driver.find_element_by_xpath(
            '//*[@id="Customer_table"]//tr[1]'))
        hoverclick.click(driver.find_element_by_xpath(
            '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), '
            '"Details")]')
        )
        hoverclick.perform()
        driver.find_element_by_link_text('Expand Groups').click()
        driver.execute_script(
            'arguments[0].scrollIntoView();',
            driver.find_element_by_link_text('Subscribers')
        )
        WebDriverWait(driver, 1)
        del hoverclick
        hoverclick = ActionChains(driver)
        hoverclick.move_to_element(driver.find_element_by_xpath(
            '//*[@id="subscribers_table"]//tr[1]'))
        hoverclick.click(driver.find_element_by_xpath(
            '//*[@id="subscribers_table"]//tr[1]//td//a[contains(text(), '
            '"Terminate")]')
        )
        hoverclick.perform()
        driver.find_element_by_xpath('//*[@id="dataConfirmOK"]').click()
        WebDriverWait(driver, 10).until(EC.presence_of_element_located(
            (By.XPATH, '//*[@id="content"]//div[@class="alert alert-info"]')))
        driver.close()


if __name__ == '__main__':
    nose2.main()
