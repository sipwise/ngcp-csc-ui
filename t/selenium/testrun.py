import unittest
import os
import nose2
import time
import functions.Collections as Collections
import functions.Functions as Functions
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

domainname = "thistextwillbereplaced"
filename = 0


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
        self.longMessage = True

    def test_a_create_subscriber(self):
        global domainname
        global filename
        filename = "test_a_create_subscriber.png"
        driver = self.driver
        Collections.create_subscriber(self.driver)
        driver.find_element_by_link_text('Expand Groups').click()
        domainname = driver.find_element_by_xpath(
            '//*[@id="subscribers_table"]//tr[1]/td[3]').text
        self.assertFalse(domainname == "", "Subscriber has not been created")
        filename = 0

    def test_b_login_logout(self):
        global domainname
        global filename
        filename = "test_b_login_logout.png"
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
            '"text"]', "testuser@" + domainname)
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
        filename = 0

    def test_c_call_blocking(self):
        global domainname
        global filename
        filename = "test_c_call_blocking.png"
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
        self.assertEquals("12345", driver.find_element_by_xpath(
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
        driver.implicitly_wait(1)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element((
            By.XPATH, '//*[@id="q-app"]//div[@class="csc-spinner"]/svg')))
        driver.implicitly_wait(10)
        self.assertEquals("54321", driver.find_element_by_xpath(
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
        self.assertEquals("12345", driver.find_element_by_xpath(
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
        driver.implicitly_wait(1)
        WebDriverWait(driver, 10).until(EC.invisibility_of_element((
            By.XPATH, '//*[@id="q-app"]//div[@class="csc-spinner"]/svg')))
        driver.implicitly_wait(10)
        self.assertEquals("54321", driver.find_element_by_xpath(
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
            '[contains(text(), "Privacy")]')))
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
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_d_call_forward_always(self):
        global domainname
        global filename
        filename = "test_d_call_forward_always.png"
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
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
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[1]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[1]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[2]/div[@class='
            '"add-destination-form"]/button')))
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
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[2]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[2]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[3]/div'
            '[@class="add-destination-form"]/button')))
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
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[3]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[3]/div[@class="add-destination-form"]'
            '/button').click()
        driver.find_element_by_xpath(
            '//div[@class="q-popover animate-scale"]//div[contains(text(),'
            ' "Add Voicemail")]').click()
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((
            By.XPATH, '//*[@id="q-app"]//div[3]/div'
            '[@class="add-destination-form"]/button')))
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="q-field-content col-xs-12 col-sm"]'
            '/div[@tabindex="0"]').click()
        driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[contains(@class, "csc-destination '
            'csc-own-phone")]/div[contains(@class, "dest-btns")]').click()
        self.assertTrue(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@tabindex="0"][contains(@class, "q-toggle"'
            ')]/div[@class="q-option-inner relative-position '
            'active"]').is_displayed(), "Option 'Ring own Phone' was not "
            "enabled")
        self.assertEqual(driver.find_element_by_xpath(
            '//*[@id="q-app"]//div[@class="dest-row own-phone-desktop"]/span'
        ).text, 'first ring own phone for 15 secs', "Option 'Ring own Phone' "
            "was not enabled")
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
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_e_conference_conversations(self):
        global domainname
        global filename
        filename = "test_e_conference_conversations.png"
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
            "Sharing URL is not correct")
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
            'Voicemails or Faxes found', "Section 'All' is not empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Calls")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Calls found',
            "Section 'Calls' is notempty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Faxes")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Faxes found',
            "Section 'Faxes' is not empty")
        driver.find_element_by_xpath(
            '//*[@id="csc-conversations-tabs"]//div[@class="q-tabs-scroller '
            'row no-wrap"]//span[contains(text(), "Voicemails")]').click()
        self.assertEquals(driver.find_element_by_xpath(
            '//*[@id="csc-conversation-content"]/div[@class="row justify-'
            'center csc-conversation-list-message"]').text, 'No Voicemails '
            'found', "Section 'Voicemails' is not empty")
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_f_reminder(self):
        global domainname
        global filename
        filename = "test_f_reminder.png"
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
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_g_settings(self):
        global domainname
        global filename
        filename = "test_g_settings.png"
        driver = self.driver
        Collections.login(driver, "testuser@" + domainname, "testpasswd")
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
        Collections.login(driver, "testuser@" + domainname, "pass1234")
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

    def test_h_speed_dial(self):
        global domainname
        global filename
        filename = "test_h_speed_dial.png"
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
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_i_voicebox(self):
        global domainname
        global filename
        filename = "test_i_voicebox.png"
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
        Collections.logout(driver)
        self.assertEqual(
            driver.current_url, os.environ['CATALYST_SERVER'] +
            "/login/subscriber/#/login", "Logout failed")
        filename = 0

    def test_z_delete_subscriber(self):
        global domainname
        global filename
        filename = "test_z_delete_subscriber.png"
        driver = self.driver
        Collections.delete_subscriber(driver)
        driver.find_element_by_link_text('Expand Groups').click()
        driver.execute_script(
            'arguments[0].scrollIntoView();',
            driver.find_element_by_link_text('Subscribers')
        )
        self.assertTrue(driver.find_element_by_css_selector(
            '#subscribers_table tr > td.dataTables_empty').is_displayed(),
            "Subscriber has not been deleted")
        filename = 0

    def tearDown(self):
        global filename
        driver = self.driver
        if filename:
            driver.save_screenshot('/results/' + filename)
            filename = 0
        driver.close()


if __name__ == '__main__':
    nose2.main()
