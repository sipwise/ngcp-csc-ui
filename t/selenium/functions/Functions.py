import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
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
        webelem = driver.find_element_by_xpath(element)
    else:
        webelem = driver.find_element_by_link_text(element)
    driver.execute_script("arguments[0].scrollIntoView();", webelem)


def move_and_click(driver, element):
    webelement = driver.find_element_by_xpath(element)
    hoverclick = ActionChains(driver)
    hoverclick.move_to_element_with_offset(
        driver.find_element_by_xpath('/html/body'), 100, 100)
    hoverclick.move_to_element(webelement)
    hoverclick.click()
    hoverclick.perform()


def click_js(driver, element):
    if element[:1] == "/":
        webelement = driver.find_element_by_xpath(element)
    else:
        webelement = driver.find_element_by_link_text(element)
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
