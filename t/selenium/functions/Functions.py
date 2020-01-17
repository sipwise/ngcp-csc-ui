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


def move_and_click(driver, element, fallback=None):
    hoverclick = ActionChains(driver)
    if fallback:
        hoverclick.move_to_element(
            driver.find_element_by_xpath(fallback))
    hoverclick.move_to_element(
        driver.find_element_by_xpath(element))
    hoverclick.click()
    hoverclick.perform()
