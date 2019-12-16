import unittest
import os
import nose2
import time
import functions.Collections as Collections
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

domainname = "thistextwillbereplaced"


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

    def test_a_create_subscriber(self):
        global domainname
        driver = self.driver
        Collections.create_subscriber(self.driver)
        driver.find_element_by_link_text('Expand Groups').click()
        domainname = driver.find_element_by_xpath(
            '//*[@id="subscribers_table"]//tr[1]/td[3]').text

    def test_b_login_logout(self):
        global domainname
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
            '//div[contains(text(), "Logout")]').click()
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_c_call_blocking(self):
        global domainname
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
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
            '[contains(text(), "Only incoming calls")]'
        )))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only incoming calls")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div/button[contains(@class, '
            '"q-btn-flat")]/span[contains(@class, "q-btn-inner")]'
        )))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]'
            '/span[contains(@class, "q-btn-inner")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@type="text"]').send_keys('123456789')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-form-actions row justify-center'
            '"]/button[2]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, '
            '"q-toggle")]/div[contains(@class, "active")]').is_displayed(),
            "Option 'All anonymous incoming calls are blocked' was enabled")
        self.assertEquals("123456789", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number '
            'csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]'
        )))
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
            "Number has been deleted")
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Outgoing")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only outgoing calls")]'
        )))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-item-label"]'
            '[contains(text(), "Only outgoing calls")]').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div/button[contains(@class, '
            '"q-btn-flat")]/span[contains(@class, "q-btn-inner")]'
        )))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/button[contains(@class, "q-btn-flat")]'
            '/span[contains(@class, "q-btn-inner")]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div/input[@type="text"]').send_keys('123456789')
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="csc-form-actions row justify-center'
            '"]/button[2]').click()
        self.assertEquals("123456789", driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-blocked-number '
            'csc-list-item ")]//div[@class="q-item-label"]').text,
            "Number is correct")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[contains(@class, "q-item-side")]/'
            'div[@class="q-item-"]/button[contains(@class, "q-btn")]'
        )))
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
            "Number has been deleted")
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
            "Option 'hide number' enabled")
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_d_conference_conversations(self):
        global domainname
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Join conference")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Join conference")]').click()
        driver.find_element_by_xpath(
            '//*[@id="csc-conf-link-input"]/div/input').send_keys(
                "testconference")
        driver.find_element_by_xpath(
            '//*[@id="csc-conf-link-input"]/div/button[contains'
            '(@class, "text-primary")]').click()
        self.assertEqual(driver.current_url, driver.find_element_by_xpath(
            '//div/input[@readonly="readonly"]').get_attribute('value'),
            "Sharing URL is correct")
        driver.find_element_by_xpath('/html/body').send_keys(Keys.ESCAPE)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((
            By.XPATH, '/html/body/div[@class="modal fullscreen row minimized'
            ' flex-center"][@style="display: none;"]')))
        driver.find_element_by_xpath(
            '//*[@id="csc-conf-header"]/div/button').click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Conversations")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Conversations")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Calls, '
            'Voicemails or Faxes found', "Section 'All' is empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Calls")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Calls found',
            "Section 'Calls' is empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Faxes")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Faxes found',
            "Section 'Faxes' is empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Voicemails")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Voicemails '
            'found', "Section 'Voicemails' is empty")
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_e_reminder(self):
        global domainname
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
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
            "Reminder is enabled")
        self.assertEqual('13:35', driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains'
            '(@class, "q-input-target justify-start")]').text,
            "Time is correct")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"]/div'
            '[contains(@class, "active")]/../'
            'span[contains(text(), "Always")]').is_displayed(),
            "Option 'Always' was selected")
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_f_speed_dial(self):
        global domainname
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]')))
        driver.find_element_by_xpath(
            '//*[@id="main-menu"]//div[@class="q-item-label"]'
            '[contains(text(), "Speed Dial")]').click()
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
            '//div[@class="modal-buttons row"]//button[contains(@class, '
            '"text-negative")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "No speed dials found")]')
            .is_displayed())
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_g_voicebox(self):
        global domainname
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
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
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../../'
            'i[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../'
            'input').send_keys(Keys.CONTROL + "a")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../'
            'input').send_keys(Keys.DELETE)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../'
            'input').send_keys("12345")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../../'
            'i[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../'
            'input').send_keys("invalid")
        self.assertTrue(driver.find_element_by_xpath(
                '//*[@id="q-app"]//div[@class="q-field-error col"'
                ']').is_displayed, "Invalid Email was detected")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../../'
            'i[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../'
            'input').send_keys(Keys.CONTROL + "a")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../'
            'input').send_keys(Keys.DELETE)
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../'
            'input').send_keys("test@email.com")
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../../'
            'i[1]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "q-toggle")]/span[contains'
            '(text(), "Delete voicemail")]').click()
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change PIN")]/../input')
            .get_attribute('value'), "12345", "PIN is correct")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(text(), "Change Email")]/../input')
            .get_attribute('value'), "test@email.com", "Email is correct")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-toggle-enabled")]'
            '/span[contains(text(), "Attach voicemail")]').is_displayed(),
            "Option 'Attach voicemail to email notification' was enabled")
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-toggle-enabled")]'
            '/span[contains(text(), "Delete voicemail")]').is_displayed(),
            "Option 'Delete voicemail after email notification is delivered' "
            "was enabled")
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Successfully logged out")

    def test_z_delete_subscriber(self):
        global domainname
        driver = self.driver
        Collections.delete_subscriber(driver)
        driver.find_element_by_link_text('Expand Groups').click()
        driver.execute_script(
            'arguments[0].scrollIntoView();',
            driver.find_element_by_link_text('Subscribers')
        )
        self.assertTrue(driver.find_element_by_css_selector(
            '#subscribers_table tr > td.dataTables_empty').is_displayed(),
            "Subscriber has been successfully deleted")

    def tearDown(self):
        driver = self.driver
        driver.close()


if __name__ == '__main__':
    nose2.main()
