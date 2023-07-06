from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


def fill_element(driver, element, text, pathtype=By.XPATH):
    elem = driver.find_element(pathtype, element)
    elem.send_keys(Keys.CONTROL + "a")
    elem.send_keys(Keys.DELETE)
    elem.send_keys(text)


def scroll_to_element(driver, element):
    if element[:1] == "/":
        webelem = driver.find_element(By.XPATH, element)
    else:
        webelem = driver.find_element(By.LINK_TEXT, element)
    driver.execute_script("arguments[0].scrollIntoView();", webelem)


def click_js(driver, element):
    if element[:1] == "/":
        webelement = driver.find_element(By.XPATH, element)
    else:
        webelement = driver.find_element(By.LINK_TEXT ,element)
    driver.execute_script("arguments[0].click();", webelement)


def create_driver():
    profile = webdriver.FirefoxProfile()
    profile.accept_untrusted_certs = True
    caps = DesiredCapabilities().FIREFOX
    caps["pageLoadStrategy"] = "normal"
    driver = webdriver.Firefox(
        capabilities=caps, firefox_profile=profile,
        service_log_path='/dev/null', )
    driver.implicitly_wait(10)
    return driver


def wait_for_loading_screen(driver):
    driver.implicitly_wait(1)
    for i in range(1, 5):
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((
            By.XPATH, '//div[@class="q-loading animate-fade fullscreen column '
            'flex-center z-maxundefined"]/svg[@class="q-spinner q-spinner-mat '
            'text-white"]')))
    driver.implicitly_wait(10)


def wait_for_invisibility(driver, xpath):
    driver.implicitly_wait(2)
    WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.XPATH, xpath)))
    driver.implicitly_wait(10)


def check_if_unchecked(driver, element):
    checkmark = driver.find_element(By.XPATH, element)
    if not checkmark.is_selected():
        click_js(driver, element)
